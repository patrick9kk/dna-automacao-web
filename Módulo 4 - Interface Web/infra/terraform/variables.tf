variable "aws_region"    { type = string; default = "us-east-1" }
variable "environment"   { type = string }
variable "project_name"  { type = string; default = "dna-automacao" }

variable "domain_name" {
  description = "Domínio da aplicação (ex: automacao.dnafacilities.com.br)"
  type        = string
  default     = "automacao.dnafacilities.com.br"
}

variable "acm_certificate_arn" {
  description = "ARN do certificado ACM em us-east-1 para o CloudFront"
  type        = string
}

variable "api_gateway_url" {
  description = "URL base do API Gateway (Módulo 1 + 2)"
  type        = string
}

variable "cognito_user_pool_id"    { type = string }
variable "cognito_client_id"       { type = string }
variable "cognito_domain"          { type = string }
variable "waf_acl_arn"             { type = string; default = "" }
