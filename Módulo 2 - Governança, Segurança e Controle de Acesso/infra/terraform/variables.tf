variable "aws_region"    { type = string; default = "us-east-1" }
variable "environment"   { type = string }
variable "project_name"  { type = string; default = "dna-automacao" }

variable "saml_metadata_url" {
  description = "URL do metadata SAML 2.0 do IdP corporativo (Azure AD, Okta, etc)"
  type        = string
}

variable "cognito_domain_prefix" {
  description = "Prefixo do domínio do Cognito User Pool (ex: dna-automacao)"
  type        = string
  default     = "dna-automacao"
}

variable "audit_log_retention_days" {
  description = "Retenção dos logs no CloudWatch (dias)"
  type        = number
  default     = 365
}

variable "audit_s3_retention_years" {
  description = "Retenção dos logs de auditoria no S3 com Object Lock (anos)"
  type        = number
  default     = 5
}

variable "waf_rate_limit" {
  description = "Máximo de requisições por IP a cada 5 minutos"
  type        = number
  default     = 2000
}

variable "allowed_ip_cidrs" {
  description = "Lista de CIDRs permitidos na WAF (vazio = sem restrição por IP)"
  type        = list(string)
  default     = []
}

variable "jwt_issuer_url" {
  description = "URL issuer do token JWT do Cognito"
  type        = string
  default     = ""
}
