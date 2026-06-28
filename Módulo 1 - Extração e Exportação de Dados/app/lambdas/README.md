# Lambdas — Módulo 1: Extração e Exportação de Dados

## Fluxo
```
Usuário → API Gateway → [request_report] → SQS → [process_report] → S3
                                                                      ↓
                                                              [notify_user] → SES → Usuário
```

## Funções

| Função           | Trigger       | Timeout | Memória |
|------------------|---------------|---------|---------|
| request_report   | API Gateway   | 30s     | 256 MB  |
| process_report   | SQS           | 300s    | 512 MB  |
| notify_user      | Invocação direta | 30s  | 256 MB  |

## Deploy local para teste
```bash
pip install -r requirements.txt
python -m pytest tests/
```
