"""
Lambda: request_report
Recebe a requisição do usuário via API Gateway, valida e enfileira no SQS.
"""
import json
import uuid
import os
import boto3
from datetime import datetime, timezone

sqs = boto3.client("sqs")

QUEUE_URL = os.environ["REPORTS_QUEUE_URL"]

ALLOWED_FORMATS = {"csv", "xlsx", "pdf"}
ALLOWED_TYPES   = {"operational", "managerial", "executive"}


def lambda_handler(event, context):
    try:
        body = json.loads(event.get("body", "{}"))
    except json.JSONDecodeError:
        return _response(400, {"error": "Body JSON inválido"})

    # Validação básica
    report_type   = body.get("report_type", "")
    output_format = body.get("format", "csv").lower()
    date_from     = body.get("date_from")
    date_to       = body.get("date_to")
    user_email    = body.get("user_email", "")
    filters       = body.get("filters", {})

    if report_type not in ALLOWED_TYPES:
        return _response(400, {"error": f"report_type deve ser um de: {ALLOWED_TYPES}"})
    if output_format not in ALLOWED_FORMATS:
        return _response(400, {"error": f"format deve ser um de: {ALLOWED_FORMATS}"})
    if not user_email:
        return _response(400, {"error": "user_email é obrigatório"})

    # Metadados do job
    job_id     = str(uuid.uuid4())
    requested_at = datetime.now(timezone.utc).isoformat()

    # Extrai contexto do usuário (ABAC) — injetado pelo Cognito via JWT claims
    authorizer  = event.get("requestContext", {}).get("authorizer", {})
    user_id     = authorizer.get("claims", {}).get("sub", "unknown")
    department  = authorizer.get("claims", {}).get("custom:department", "ALL")
    plant       = authorizer.get("claims", {}).get("custom:plant", "ALL")

    message = {
        "job_id":       job_id,
        "requested_at": requested_at,
        "user_id":      user_id,
        "user_email":   user_email,
        "report_type":  report_type,
        "format":       output_format,
        "date_from":    date_from,
        "date_to":      date_to,
        "filters":      filters,
        "abac_scope": {
            "department": department,
            "plant":      plant,
        },
    }

    sqs.send_message(
        QueueUrl    = QUEUE_URL,
        MessageBody = json.dumps(message),
        MessageGroupId = report_type  # Para FIFO futuro
    )

    print(f"[request_report] job_id={job_id} enfileirado por user={user_id}")

    return _response(202, {
        "job_id":   job_id,
        "status":   "queued",
        "message":  "Relatório solicitado. Você receberá um e-mail quando estiver pronto.",
        "requested_at": requested_at,
    })


def _response(status_code: int, body: dict) -> dict:
    return {
        "statusCode": status_code,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps(body, ensure_ascii=False),
    }
