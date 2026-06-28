variable "aws_region"   { type = string; default = "us-east-1" }
variable "environment"  { type = string }
variable "project_name" { type = string; default = "dna-automacao" }

variable "vpc_cidr" {
  description = "CIDR block da VPC principal"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "AZs para subnets (mínimo 2 para Multi-AZ)"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b", "us-east-1c"]
}

variable "rds_instance_class" {
  description = "Classe da instância RDS"
  type        = string
  default     = "db.t3.medium"
}

variable "rds_allocated_storage_gb" {
  description = "Armazenamento inicial RDS (GB)"
  type        = number
  default     = 100
}

variable "rds_max_allocated_storage_gb" {
  description = "Armazenamento máximo com autoscaling (GB)"
  type        = number
  default     = 1000
}

variable "rds_db_name"  { type = string; default = "dna_automacao" }
variable "rds_username" { type = string; default = "dna_admin" }

variable "hot_data_days" {
  description = "Dias de retenção no RDS (hot data)"
  type        = number
  default     = 90
}

variable "cold_data_years" {
  description = "Anos de retenção no S3 Data Lake (cold data)"
  type        = number
  default     = 7
}

variable "glue_job_schedule" {
  description = "Cron para execução do job Glue de migração hot → cold"
  type        = string
  default     = "cron(0 2 * * ? *)"  # Todo dia às 2h UTC
}

variable "athena_results_bucket" {
  description = "Bucket para resultados das queries Athena"
  type        = string
  default     = ""
}
