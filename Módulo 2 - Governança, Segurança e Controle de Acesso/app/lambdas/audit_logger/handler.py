"""
Lambda: audit_logger
Consome eventos de auditoria do SQS e os grava em:
  1. Amazon CloudWatch Logs (pesquisa em tempo real)
  2. Amazon S3 com Object Lock COMPLIANCE (imutabilidade para LGPD/ISO 27001)

Cada registro inclui: user_id, timestamp, IP, ação, filtros e hash de validação.
"""
import os
import json
import time
import uuid
import hashlib
import boto3
import logging
from datetime import datetime, timezone

logger = logging.getLogger()
logger.setLevel(logging.INFO)

logs = boto3.client("logs")
s3   = boto3.client("s3")

LOG_GROUP   = os.environ["AUDIT_LOG_GROUP"]
BUCKET      = os.environ["AUDIT_BUCKET"]
ENVIRONMENT = os.environ.get("ENVIRONMENT", "dev")

# Log stream diário
def _log_stream_name() -> str:
    return datetime.now(timezone.utc).strftime("%Y/%m/%d")


def lambda_handler(event, context):
    records = event.get("Records", [])
    logger.info(f"Processando {len(records)} evento(s) de auditoria")

    for record in records:
        try:
            payload = json.loads(record["body"])
            _write_audit_record(payload)
        except Exception as exc:
            logger.error(f"Falha ao gravar auditoria: {exc}", exc_info=True)
            raise  # Devolve ao SQS para reprocessamento


def _write_audit_record(payload: dict):
    # Normaliza e enriquece o registro
    record = _build_record(payload)
    record_json = json.dumps(record, ensure_ascii=False)

    # 1. Grava no CloudWatch Logs
    _write_cloudwatch(record_json)

    # 2. Grava no S3 (imutável via Object Lock)
    _write_s3(record, record_json)

    logger.info(f"Auditoria registrada: event_type={record['event_type']} user={record['user_id']} record_id={record['record_id']}")


def _build_record(payload: dict) -> dict:
    now   = datetime.now(timezone.utc)
    ts    = now.isoformat()
    r_id  = str(uuid.uuid4())

    # Hash de validação (SHA-256 dos campos críticos)
    hash_input = f"{r_id}|{ts}|{payload.get('user_id','')}|{payload.get('event_type','')}|{payload.get('source_ip','')}"
    validation_hash = hashlib.sha256(hash_input.encode()).hexdigest()

    return {
        "record_id":       r_id,
        "schema_version":  "1.0",
        "environment":     ENVIRONMENT,
        "timestamp":       ts,
        "timestamp_epoch": int(now.timestamp()),
        # Identidade
        "user_id":         payload.get("user_id", "unknown"),
        "email":           payload.get("email", ""),
        "role":            payload.get("role", ""),
        "department":      payload.get("department", ""),
        "plant":           payload.get("plant", ""),
        # Evento
        "event_type":      payload.get("event_type", "UNKNOWN"),
        "source_ip":       payload.get("source_ip", ""),
        "resource":        payload.get("resource", ""),
        "action":          payload.get("action", ""),
        # Parâmetros de extração (quando aplicável)
        "report_type":     payload.get("report_type", ""),
        "output_format":   payload.get("format", ""),
        "date_from":       payload.get("date_from", ""),
        "date_to":         payload.get("date_to", ""),
        "filters":         payload.get("filters", {}),
        "job_id":          payload.get("job_id", ""),
        # Razão de falha (quando AUTH_FAILURE ou DENIED)
        "reason":          payload.get("reason", ""),
        # Integridade
        "validation_hash": validation_hash,
    }


def _write_cloudwatch(record_json: str):
    stream_name = _log_stream_name()

    # Cria stream se não existir
    try:
        logs.create_log_stream(logGroupName=LOG_GROUP, logStreamName=stream_name)
    except logs.exceptions.ResourceAlreadyExistsException:
        pass

    logs.put_log_events(
        logGroupName  = LOG_GROUP,
        logStreamName = stream_name,
        logEvents     = [{
            "timestamp": int(time.time() * 1000),
            "message":   record_json,
        }]
    )


def _write_s3(record: dict, record_json: str):
    ts         = datetime.fromisoformat(record["timestamp"])
    event_type = record["event_type"]
    r_id       = record["record_id"]

    # Particionamento Hive-style para queries Athena futuras
    s3_key = (
        f"audit-logs/"
        f"year={ts.year}/month={ts.month:02d}/day={ts.day:02d}/"
        f"event_type={event_type}/"
        f"{r_id}.json"
    )

    s3.put_object(
        Bucket      = BUCKET,
        Key         = s3_key,
        Body        = record_json.encode("utf-8"),
        ContentType = "application/json",
        Metadata    = {
            "record-id":    r_id,
            "event-type":   event_type,
            "user-id":      record["user_id"],
            "environment":  ENVIRONMENT,
        },
    )
