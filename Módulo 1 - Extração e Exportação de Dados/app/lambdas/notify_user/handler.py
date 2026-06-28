"""
Lambda: notify_user
Gera uma Presigned URL do S3 e envia e-mail via SES com o link de download.
"""
import json
import os
import boto3
import logging
from datetime import datetime, timezone

logger = logging.getLogger()
logger.setLevel(logging.INFO)

s3  = boto3.client("s3")
ses = boto3.client("ses")

BUCKET       = os.environ["REPORTS_BUCKET"]
EXPIRY       = int(os.environ.get("PRESIGNED_URL_EXPIRY", "900"))
SENDER_EMAIL = os.environ["SES_SENDER_EMAIL"]


def lambda_handler(event, context):
    # Aceita invocação direta (dict) ou via S3 Event
    if "Records" in event:
        for record in event["Records"]:
            payload = json.loads(record.get("body", record))
            _notify(payload)
    else:
        _notify(event)


def _notify(payload: dict):
    job_id      = payload["job_id"]
    s3_key      = payload["s3_key"]
    user_email  = payload["user_email"]
    fmt         = payload.get("format", "csv").upper()
    report_type = payload.get("report_type", "")

    # Gera URL assinada com expiração curta
    presigned_url = s3.generate_presigned_url(
        "get_object",
        Params     = {"Bucket": BUCKET, "Key": s3_key},
        ExpiresIn  = EXPIRY,
    )

    expiry_min = EXPIRY // 60
    subject    = f"[DNA Automação] Seu relatório {report_type.upper()} está pronto"
    body_html  = f"""
    <html><body style="font-family:Arial,sans-serif;color:#222;">
      <h2 style="color:#1F4E79;">Relatório pronto para download</h2>
      <p>Olá,</p>
      <p>O seu relatório do tipo <strong>{report_type}</strong> no formato <strong>{fmt}</strong>
         foi gerado com sucesso.</p>
      <p>
        <a href="{presigned_url}"
           style="background:#1F4E79;color:#fff;padding:10px 20px;border-radius:4px;text-decoration:none;">
          Baixar Relatório
        </a>
      </p>
      <p style="color:#888;font-size:12px;">
        Este link expira em <strong>{expiry_min} minutos</strong>.<br>
        Job ID: {job_id}
      </p>
      <hr/><p style="font-size:11px;color:#aaa;">DNA Facilities — Sistema de Automação</p>
    </body></html>
    """

    ses.send_email(
        Source      = SENDER_EMAIL,
        Destination = {"ToAddresses": [user_email]},
        Message     = {
            "Subject": {"Data": subject, "Charset": "UTF-8"},
            "Body":    {"Html": {"Data": body_html, "Charset": "UTF-8"}},
        },
    )

    logger.info(f"[notify_user] E-mail enviado para {user_email} | job_id={job_id}")
