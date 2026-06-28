# ── Athena Workgroup ───────────────────────────────────────────────────────
resource "aws_athena_workgroup" "dna" {
  name        = "${var.project_name}-${var.environment}"
  description = "Workgroup DNA Automação — queries no Data Lake"

  configuration {
    enforce_workgroup_configuration    = true
    publish_cloudwatch_metrics_enabled = true

    result_configuration {
      output_location = "s3://${aws_s3_bucket.athena_results.bucket}/query-results/"
      encryption_configuration {
        encryption_option = "SSE_S3"
      }
    }

    engine_version {
      selected_engine_version = "Athena engine version 3"
    }

    bytes_scanned_cutoff_per_query = 10737418240  # 10 GB — proteção de custo
  }
}

# ── Named Queries (queries frequentes pré-salvas) ─────────────────────────
resource "aws_athena_named_query" "devices_by_period" {
  name        = "dispositivos-por-periodo"
  workgroup   = aws_athena_workgroup.dna.id
  database    = aws_glue_catalog_database.dna_lake.name
  description = "Lista dispositivos com leituras em um período específico"
  query       = <<-SQL
    SELECT
      device_id,
      device_name,
      plant,
      department,
      COUNT(*) AS total_readings,
      AVG(value)  AS avg_value,
      MIN(value)  AS min_value,
      MAX(value)  AS max_value,
      MIN(reading_timestamp) AS first_reading,
      MAX(reading_timestamp) AS last_reading
    FROM automation_readings
    WHERE year  = '2025'
      AND month = '01'
    GROUP BY device_id, device_name, plant, department
    ORDER BY total_readings DESC;
  SQL
}

resource "aws_athena_named_query" "alerts_by_plant" {
  name        = "alertas-por-planta"
  workgroup   = aws_athena_workgroup.dna.id
  database    = aws_glue_catalog_database.dna_lake.name
  description = "Contagem de alertas por planta e mês"
  query       = <<-SQL
    SELECT
      plant,
      department,
      year,
      month,
      COUNT(*) AS total_alerts,
      COUNT(DISTINCT device_id) AS devices_with_alerts
    FROM automation_readings
    WHERE status = 'ALERT'
    GROUP BY plant, department, year, month
    ORDER BY year DESC, month DESC, total_alerts DESC;
  SQL
}

resource "aws_athena_named_query" "extraction_report" {
  name        = "extracao-relatorio-historico"
  workgroup   = aws_athena_workgroup.dna.id
  database    = aws_glue_catalog_database.dna_lake.name
  description = "Template para extração de relatório histórico com filtros ABAC"
  query       = <<-SQL
    -- Substitua os valores de :plant e :department conforme o escopo ABAC do usuário
    SELECT
      reading_id,
      device_id,
      device_name,
      reading_timestamp,
      parameter_name,
      value,
      unit,
      status,
      plant,
      department
    FROM automation_readings
    WHERE plant      = 'SAO_PAULO'    -- filtro ABAC: custom:plant
      AND department = 'ENGENHARIA'   -- filtro ABAC: custom:department
      AND year  BETWEEN '2024' AND '2025'
    ORDER BY reading_timestamp DESC
    LIMIT 100000;
  SQL
}

output "athena_workgroup_name" { value = aws_athena_workgroup.dna.name }

# ── terraform.tfvars.example ───────────────────────────────────────────────
