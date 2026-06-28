variable "aws_region" {
  description = "Região AWS principal"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Ambiente de deploy (dev | staging | prod)"
  type        = string
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment deve ser dev, staging ou prod."
  }
}

variable "project_name" {
  description = "Nome base do projeto para nomear recursos"
  type        = string
  default     = "dna-automacao"
}

variable "reports_bucket_name" {
  description = "Nome do bucket S3 para relatórios gerados"
  type        = string
  default     = "dna-reports"
}

variable "presigned_url_expiry_seconds" {
  description = "Tempo de expiração da Presigned URL (segundos)"
  type        = number
  default     = 900 # 15 minutos
}

variable "sqs_visibility_timeout" {
  description = "Timeout de visibilidade da fila SQS (segundos)"
  type        = number
  default     = 300
}

variable "lambda_timeout" {
  description = "Timeout das Lambdas de processamento (segundos)"
  type        = number
  default     = 300
}

variable "lambda_memory_mb" {
  description = "Memória alocada às Lambdas (MB)"
  type        = number
  default     = 512
}

variable "ses_sender_email" {
  description = "E-mail remetente verificado no SES"
  type        = string
}

variable "report_retention_days" {
  description = "Dias de retenção dos relatórios no S3"
  type        = number
  default     = 7
}
