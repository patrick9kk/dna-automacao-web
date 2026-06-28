"""
Lambda: token_authorizer
Authorizer customizado para API Gateway.
Valida token JWT do Cognito, extrai claims ABAC e gera política IAM dinâmica.
Publica evento de autenticação na fila de auditoria.
"""
import os
import json
import time
import boto3
import logging
import urllib.request
from functools import lru_cache
from jose import jwk, jwt
from jose.utils import base64url_decode

logger = logging.getLogger()
logger.setLevel(logging.INFO)

sqs = boto3.client("sqs")

POOL_ID       = os.environ["COGNITO_USER_POOL_ID"]
REGION        = os.environ.get("AWS_COGNITO_REGION", "us-east-1")
ENVIRONMENT   = os.environ.get("ENVIRONMENT", "dev")
AUDIT_QUEUE   = os.environ.get("AUDIT_QUEUE_URL", "")
ISSUER        = f"https://cognito-idp.{REGION}.amazonaws.com/{POOL_ID}"
JWKS_URL      = f"{ISSUER}/.well-known/jwks.json"

# Roles permitidos e seus níveis de acesso
ROLE_PERMISSIONS = {
    "Administrador": ["reports:*", "audit:read", "users:manage"],
    "Analista":      ["reports:request", "reports:read"],
    "Auditor":       ["audit:read"],
}


@lru_cache(maxsize=1)
def _get_jwks():
    with urllib.request.urlopen(JWKS_URL, timeout=3) as resp:
        return json.loads(resp.read())["keys"]


def lambda_handler(event, context):
    token = _extract_token(event)
    if not token:
        logger.warning("Token ausente na requisição")
        raise Exception("Unauthorized")

    try:
        claims = _verify_token(token)
    except Exception as exc:
        logger.warning(f"Token inválido: {exc}")
        _publish_audit_event("AUTH_FAILURE", {}, event, reason=str(exc))
        raise Exception("Unauthorized")

    user_id    = claims.get("sub", "unknown")
    groups     = claims.get("cognito:groups", [])
    email      = claims.get("email", "")
    department = claims.get("custom:department", "ALL")
    plant      = claims.get("custom:plant", "ALL")
    role       = groups[0] if groups else "Analista"

    _publish_audit_event("AUTH_SUCCESS", {
        "user_id":    user_id,
        "email":      email,
        "role":       role,
        "department": department,
        "plant":      plant,
    }, event)

    logger.info(f"Auth OK: user={user_id} role={role} dept={department} plant={plant}")

    policy = _generate_policy(user_id, "Allow", event["methodArn"], {
        "user_id":    user_id,
        "email":      email,
        "role":       role,
        "department": department,
        "plant":      plant,
    })
    return policy


def _extract_token(event: dict) -> str | None:
    auth_header = event.get("authorizationToken", "")
    if auth_header.startswith("Bearer "):
        return auth_header[7:]
    return None


def _verify_token(token: str) -> dict:
    # Decodifica header sem verificar assinatura
    header = jwt.get_unverified_header(token)
    kid    = header.get("kid")

    # Encontra a chave pública correta no JWKS
    keys   = _get_jwks()
    key    = next((k for k in keys if k["kid"] == kid), None)
    if not key:
        raise ValueError(f"Chave pública não encontrada para kid={kid}")

    public_key = jwk.construct(key)
    message, encoded_sig = token.rsplit(".", 1)
    decoded_sig = base64url_decode(encoded_sig.encode())

    if not public_key.verify(message.encode(), decoded_sig):
        raise ValueError("Assinatura JWT inválida")

    claims = jwt.get_unverified_claims(token)

    # Valida issuer e expiração
    if claims.get("iss") != ISSUER:
        raise ValueError(f"Issuer inválido: {claims.get('iss')}")
    if claims.get("exp", 0) < time.time():
        raise ValueError("Token expirado")

    return claims


def _generate_policy(principal_id: str, effect: str, resource: str, context: dict) -> dict:
    return {
        "principalId": principal_id,
        "policyDocument": {
            "Version": "2012-10-17",
            "Statement": [{
                "Action":   "execute-api:Invoke",
                "Effect":   effect,
                "Resource": resource,
            }]
        },
        "context": context,  # Disponível em event.requestContext.authorizer.*
    }


def _publish_audit_event(event_type: str, user_data: dict, raw_event: dict, reason: str = ""):
    if not AUDIT_QUEUE:
        return
    try:
        payload = {
            "event_type":  event_type,
            "timestamp":   time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "environment": ENVIRONMENT,
            "source_ip":   raw_event.get("requestContext", {}).get("identity", {}).get("sourceIp", "unknown"),
            "reason":      reason,
            **user_data,
        }
        sqs.send_message(QueueUrl=AUDIT_QUEUE, MessageBody=json.dumps(payload))
    except Exception as exc:
        logger.error(f"Falha ao publicar evento de auditoria: {exc}")
