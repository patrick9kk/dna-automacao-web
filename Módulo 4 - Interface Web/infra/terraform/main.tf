terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.0" }
  }
  backend "s3" {
    bucket = "dna-terraform-state"
    key    = "modulo4/interface-web/terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = var.aws_region
  default_tags {
    tags = {
      Project     = "DNA-Automacao"
      Module      = "Modulo4-InterfaceWeb"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# CloudFront precisa de ACM em us-east-1 independente da região principal
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}
