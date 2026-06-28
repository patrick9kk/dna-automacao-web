terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.0" }
  }
  backend "s3" {
    bucket = "dna-terraform-state"
    key    = "modulo2/governanca-seguranca/terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = var.aws_region
  default_tags {
    tags = {
      Project     = "DNA-Automacao"
      Module      = "Modulo2-GovernancaSeguranca"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}
