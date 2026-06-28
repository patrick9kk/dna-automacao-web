-- ============================================================
-- DNA Automação — Schema PostgreSQL (RDS Hot Data)
-- Versão: 1.0 | Ambiente: todos
-- ============================================================

-- Extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- ── Plantas / Unidades ────────────────────────────────────────────────────
CREATE TABLE plants (
    plant_id    UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    plant_code  VARCHAR(20) NOT NULL UNIQUE,
    plant_name  VARCHAR(100) NOT NULL,
    location    VARCHAR(200),
    timezone    VARCHAR(50)  NOT NULL DEFAULT 'America/Sao_Paulo',
    is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── Departamentos ─────────────────────────────────────────────────────────
CREATE TABLE departments (
    dept_id     UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    dept_code   VARCHAR(20) NOT NULL UNIQUE,
    dept_name   VARCHAR(100) NOT NULL,
    plant_id    UUID        NOT NULL REFERENCES plants(plant_id),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Dispositivos de Automação ─────────────────────────────────────────────
CREATE TABLE devices (
    device_id    UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_code  VARCHAR(50)  NOT NULL UNIQUE,
    device_name  VARCHAR(200) NOT NULL,
    device_type  VARCHAR(50)  NOT NULL,  -- PLC, SENSOR, ACTUATOR, HMI, SCADA
    protocol     VARCHAR(50),             -- Modbus, OPC-UA, MQTT, etc.
    plant_id     UUID         NOT NULL REFERENCES plants(plant_id),
    dept_id      UUID         NOT NULL REFERENCES departments(dept_id),
    ip_address   INET,
    is_active    BOOLEAN      NOT NULL DEFAULT TRUE,
    metadata     JSONB        NOT NULL DEFAULT '{}',
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_devices_plant   ON devices(plant_id);
CREATE INDEX idx_devices_dept    ON devices(dept_id);
CREATE INDEX idx_devices_type    ON devices(device_type);

-- ── Leituras de Automação (HOT DATA) ─────────────────────────────────────
CREATE TABLE automation_readings (
    reading_id        UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id         UUID         NOT NULL REFERENCES devices(device_id),
    reading_timestamp TIMESTAMPTZ  NOT NULL,
    parameter_name    VARCHAR(100) NOT NULL,
    value             NUMERIC(18,6),
    raw_value         TEXT,
    unit              VARCHAR(20),
    status            VARCHAR(20)  NOT NULL DEFAULT 'OK'
                        CHECK (status IN ('OK','ALERT','WARNING','ERROR','OFFLINE')),
    quality           SMALLINT     NOT NULL DEFAULT 100 CHECK (quality BETWEEN 0 AND 100),
    -- Campos desnormalizados para performance de query e filtro ABAC
    plant             VARCHAR(20)  NOT NULL,
    department        VARCHAR(20)  NOT NULL,
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
) PARTITION BY RANGE (reading_timestamp);

-- Partições mensais (últimos 90 dias = ~3 meses)
CREATE TABLE automation_readings_2025_10 PARTITION OF automation_readings
    FOR VALUES FROM ('2025-10-01') TO ('2025-11-01');
CREATE TABLE automation_readings_2025_11 PARTITION OF automation_readings
    FOR VALUES FROM ('2025-11-01') TO ('2025-12-01');
CREATE TABLE automation_readings_2025_12 PARTITION OF automation_readings
    FOR VALUES FROM ('2025-12-01') TO ('2026-01-01');
CREATE TABLE automation_readings_2026_01 PARTITION OF automation_readings
    FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
CREATE TABLE automation_readings_2026_02 PARTITION OF automation_readings
    FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
CREATE TABLE automation_readings_2026_03 PARTITION OF automation_readings
    FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');

CREATE INDEX idx_readings_device_ts ON automation_readings(device_id, reading_timestamp DESC);
CREATE INDEX idx_readings_plant     ON automation_readings(plant, reading_timestamp DESC);
CREATE INDEX idx_readings_status    ON automation_readings(status) WHERE status != 'OK';

-- ── Eventos de Dispositivos ───────────────────────────────────────────────
CREATE TABLE device_events (
    event_id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id        UUID        NOT NULL REFERENCES devices(device_id),
    event_timestamp  TIMESTAMPTZ NOT NULL,
    event_type       VARCHAR(50) NOT NULL,  -- STARTUP, SHUTDOWN, CONFIG_CHANGE, COMM_LOSS
    event_code       VARCHAR(20),
    description      TEXT,
    severity         VARCHAR(10) NOT NULL DEFAULT 'INFO'
                       CHECK (severity IN ('INFO','WARNING','CRITICAL')),
    plant            VARCHAR(20) NOT NULL,
    department       VARCHAR(20) NOT NULL,
    resolved_at      TIMESTAMPTZ,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_events_device_ts ON device_events(device_id, event_timestamp DESC);
CREATE INDEX idx_events_severity  ON device_events(severity) WHERE severity != 'INFO';

-- ── Histórico de Alertas ──────────────────────────────────────────────────
CREATE TABLE alert_history (
    alert_id       UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id      UUID        NOT NULL REFERENCES devices(device_id),
    reading_id     UUID        REFERENCES automation_readings(reading_id),
    triggered_at   TIMESTAMPTZ NOT NULL,
    resolved_at    TIMESTAMPTZ,
    alert_type     VARCHAR(50) NOT NULL,
    threshold      NUMERIC(18,6),
    actual_value   NUMERIC(18,6),
    severity       VARCHAR(10) NOT NULL CHECK (severity IN ('LOW','MEDIUM','HIGH','CRITICAL')),
    plant          VARCHAR(20) NOT NULL,
    department     VARCHAR(20) NOT NULL,
    acknowledged_by VARCHAR(200),
    notes          TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_alerts_device   ON alert_history(device_id, triggered_at DESC);
CREATE INDEX idx_alerts_severity ON alert_history(severity, triggered_at DESC);
