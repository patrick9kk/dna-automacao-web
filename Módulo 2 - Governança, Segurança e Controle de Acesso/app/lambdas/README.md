# Lambdas — Módulo 2: Governança, Segurança e Controle de Acesso

## Funções

| Função             | Trigger              | Responsabilidade |
|--------------------|----------------------|-----------------|
| token_authorizer   | API Gateway (Custom Authorizer) | Valida JWT Cognito, extrai claims ABAC, gera IAM Policy |
| audit_logger       | SQS (batch_size=10)  | Grava trilha de auditoria no CloudWatch + S3 Object Lock |

## Fluxo de Autenticação
```
Usuário (SSO SAML) → Cognito → JWT com claims ABAC
                                    ↓
API Gateway → token_authorizer → IAM Policy dinâmica
                    ↓
              audit_queue (SQS) → audit_logger → CloudWatch + S3 (imutável)
```

## Claims ABAC no JWT
- `custom:department` — Departamento do usuário (ex: Engenharia)
- `custom:plant`      — Planta/filial (ex: São Paulo)
- `custom:role`       — Papel no sistema (Administrador/Analista/Auditor)
- `cognito:groups`    — Grupos Cognito para RBAC
