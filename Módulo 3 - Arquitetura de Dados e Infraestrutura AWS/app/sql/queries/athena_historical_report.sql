-- ============================================================
-- Template Athena: Relatório Histórico de Automação
-- Data Lake: s3://dna-automacao-datalake-<env>/automation-data/
-- ============================================================

-- 1. Leituras históricas com filtro ABAC (plant + department)
SELECT
    reading_id,
    device_id,
    reading_timestamp,
    parameter_name,
    CAST(value AS DOUBLE) AS value,
    unit,
    status,
    quality,
    plant,
    department
FROM "dna_automacao_lake_prod"."automation_readings"
WHERE plant      = 'SAO_PAULO'     -- filtro ABAC: custom:plant do token JWT
  AND department = 'ENGENHARIA'    -- filtro ABAC: custom:department
  AND year  = '2025'
  AND month IN ('10', '11', '12')
ORDER BY reading_timestamp DESC
LIMIT 500000;

-- 2. Agregação por dispositivo (relatório gerencial)
SELECT
    device_id,
    parameter_name,
    year,
    month,
    COUNT(*)                AS total_readings,
    ROUND(AVG(value), 2)   AS avg_value,
    ROUND(MIN(value), 2)   AS min_value,
    ROUND(MAX(value), 2)   AS max_value,
    SUM(CASE WHEN status = 'ALERT'   THEN 1 ELSE 0 END) AS alert_count,
    SUM(CASE WHEN status = 'WARNING' THEN 1 ELSE 0 END) AS warning_count
FROM "dna_automacao_lake_prod"."automation_readings"
WHERE plant = 'SAO_PAULO'
  AND year  = '2025'
GROUP BY device_id, parameter_name, year, month
ORDER BY year DESC, month DESC, alert_count DESC;

-- 3. Disponibilidade dos dispositivos por mês
SELECT
    device_id,
    year,
    month,
    COUNT(*)  AS total_readings,
    SUM(CASE WHEN status = 'OFFLINE' THEN 1 ELSE 0 END) AS offline_readings,
    ROUND(
      100.0 * (1 - SUM(CASE WHEN status = 'OFFLINE' THEN 1 ELSE 0 END)::DOUBLE / COUNT(*)),
      2
    ) AS availability_pct
FROM "dna_automacao_lake_prod"."automation_readings"
WHERE plant      = 'SAO_PAULO'
  AND department = 'ENGENHARIA'
  AND year BETWEEN '2024' AND '2025'
GROUP BY device_id, year, month
HAVING COUNT(*) > 0
ORDER BY year DESC, month DESC, availability_pct ASC;
