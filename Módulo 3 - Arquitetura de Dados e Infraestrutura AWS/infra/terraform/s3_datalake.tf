# ── S3 Data Lake (cold storage — dados > 90 dias) ─────────────────────────
resource "aws_s3_bucket" "datalake" {
  bucket        = "${var.project_name}-datalake-${var.environment}"
  force_destroy = false
}

resource "aws_s3_bucket_versioning" "datalake" {
  bucket = aws_s3_bucket.datalake.id
  versioning_configuration { status = "Enabled" }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "datalake" {
  bucket = aws_s3_bucket.datalake.id
  rule {
    apply_server_side_encryption_by_default { sse_algorithm = "AES256" }
    bucket_key_enabled = true
  }
}

resource "aws_s3_bucket_public_access_block" "datalake" {
  bucket                  = aws_s3_bucket.datalake.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Lifecycle: Intelligent-Tiering automático após 30 dias no lake
resource "aws_s3_bucket_lifecycle_configuration" "datalake" {
  bucket = aws_s3_bucket.datalake.id

  rule {
    id     = "intelligent-tiering"
    status = "Enabled"
    filter { prefix = "automation-data/" }
    transition {
      days          = 30
      storage_class = "INTELLIGENT_TIERING"
    }
    transition {
      days          = 365
      storage_class = "GLACIER_IR"
    }
    expiration {
      days = var.cold_data_years * 365
    }
  }
}

# ── S3 Athena Results ──────────────────────────────────────────────────────
resource "aws_s3_bucket" "athena_results" {
  bucket        = "${var.project_name}-athena-results-${var.environment}"
  force_destroy = true
}

resource "aws_s3_bucket_lifecycle_configuration" "athena_results" {
  bucket = aws_s3_bucket.athena_results.id
  rule {
    id     = "expire-results"
    status = "Enabled"
    expiration { days = 3 }
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "athena_results" {
  bucket = aws_s3_bucket.athena_results.id
  rule {
    apply_server_side_encryption_by_default { sse_algorithm = "AES256" }
  }
}

resource "aws_s3_bucket_public_access_block" "athena_results" {
  bucket                  = aws_s3_bucket.athena_results.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

output "datalake_bucket_name"       { value = aws_s3_bucket.datalake.bucket }
output "datalake_bucket_arn"        { value = aws_s3_bucket.datalake.arn }
output "athena_results_bucket_name" { value = aws_s3_bucket.athena_results.bucket }
