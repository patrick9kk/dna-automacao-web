# ── SQS para eventos de auditoria ─────────────────────────────────────────
resource "aws_sqs_queue" "audit_dlq" {
  name                      = "${var.project_name}-audit-dlq-${var.environment}"
  message_retention_seconds = 1209600
}

resource "aws_sqs_queue" "audit_queue" {
  name                       = "${var.project_name}-audit-${var.environment}"
  visibility_timeout_seconds = 60
  message_retention_seconds  = 86400
  receive_wait_time_seconds  = 10
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.audit_dlq.arn
    maxReceiveCount     = 5
  })
}

# ── CloudWatch Log Group (auditoria) ──────────────────────────────────────
resource "aws_cloudwatch_log_group" "audit" {
  name              = "/dna-automacao/audit/${var.environment}"
  retention_in_days = var.audit_log_retention_days
}

# ── S3 Bucket imutável (Object Lock) ──────────────────────────────────────
resource "aws_s3_bucket" "audit_logs" {
  bucket        = "${var.project_name}-audit-logs-${var.environment}"
  force_destroy = false # nunca destruir logs de auditoria
  object_lock_enabled = true
}

resource "aws_s3_bucket_object_lock_configuration" "audit_logs" {
  bucket = aws_s3_bucket.audit_logs.id
  rule {
    default_retention {
      mode  = "COMPLIANCE"
      years = var.audit_s3_retention_years
    }
  }
}

resource "aws_s3_bucket_versioning" "audit_logs" {
  bucket = aws_s3_bucket.audit_logs.id
  versioning_configuration { status = "Enabled" }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "audit_logs" {
  bucket = aws_s3_bucket.audit_logs.id
  rule {
    apply_server_side_encryption_by_default { sse_algorithm = "AES256" }
    bucket_key_enabled = true
  }
}

resource "aws_s3_bucket_public_access_block" "audit_logs" {
  bucket                  = aws_s3_bucket.audit_logs.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# ── Lambda audit_logger ────────────────────────────────────────────────────
data "archive_file" "audit_logger_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../../app/lambdas/audit_logger"
  output_path = "/tmp/audit_logger.zip"
}

resource "aws_lambda_function" "audit_logger" {
  function_name    = "${var.project_name}-audit-logger-${var.environment}"
  role             = aws_iam_role.lambda_audit_logger_role.arn
  runtime          = "python3.12"
  handler          = "handler.lambda_handler"
  filename         = data.archive_file.audit_logger_zip.output_path
  source_code_hash = data.archive_file.audit_logger_zip.output_base64sha256
  timeout          = 60
  memory_size      = 256
  environment {
    variables = {
      ENVIRONMENT        = var.environment
      AUDIT_LOG_GROUP    = aws_cloudwatch_log_group.audit.name
      AUDIT_BUCKET       = aws_s3_bucket.audit_logs.bucket
    }
  }
}

resource "aws_lambda_event_source_mapping" "audit_sqs" {
  event_source_arn = aws_sqs_queue.audit_queue.arn
  function_name    = aws_lambda_function.audit_logger.arn
  batch_size       = 10
}

# ── Lambda token_authorizer ────────────────────────────────────────────────
data "archive_file" "token_authorizer_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../../app/lambdas/token_authorizer"
  output_path = "/tmp/token_authorizer.zip"
}

resource "aws_lambda_function" "token_authorizer" {
  function_name    = "${var.project_name}-token-authorizer-${var.environment}"
  role             = aws_iam_role.lambda_token_authorizer_role.arn
  runtime          = "python3.12"
  handler          = "handler.lambda_handler"
  filename         = data.archive_file.token_authorizer_zip.output_path
  source_code_hash = data.archive_file.token_authorizer_zip.output_base64sha256
  timeout          = 10
  memory_size      = 256
  environment {
    variables = {
      COGNITO_USER_POOL_ID = aws_cognito_user_pool.main.id
      AWS_COGNITO_REGION   = var.aws_region
      ENVIRONMENT          = var.environment
      AUDIT_QUEUE_URL      = aws_sqs_queue.audit_queue.url
    }
  }
}

output "audit_bucket_name"    { value = aws_s3_bucket.audit_logs.bucket }
output "audit_log_group_name" { value = aws_cloudwatch_log_group.audit.name }
output "audit_queue_url"      { value = aws_sqs_queue.audit_queue.url }
