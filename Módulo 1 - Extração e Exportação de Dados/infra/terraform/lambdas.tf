locals {
  lambda_runtime = "python3.12"
  lambda_env = {
    ENVIRONMENT          = var.environment
    REPORTS_BUCKET       = aws_s3_bucket.reports.bucket
    REPORTS_QUEUE_URL    = aws_sqs_queue.reports_queue.url
    PRESIGNED_URL_EXPIRY = tostring(var.presigned_url_expiry_seconds)
    SES_SENDER_EMAIL     = var.ses_sender_email
  }
}

# ── request_report ─────────────────────────────────────────────────────────
data "archive_file" "request_report_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../../app/lambdas/request_report"
  output_path = "/tmp/request_report.zip"
}

resource "aws_lambda_function" "request_report" {
  function_name    = "${var.project_name}-request-report-${var.environment}"
  role             = aws_iam_role.lambda_request_report_role.arn
  runtime          = local.lambda_runtime
  handler          = "handler.lambda_handler"
  filename         = data.archive_file.request_report_zip.output_path
  source_code_hash = data.archive_file.request_report_zip.output_base64sha256
  timeout          = 30
  memory_size      = 256
  environment { variables = local.lambda_env }
}

# ── process_report ─────────────────────────────────────────────────────────
data "archive_file" "process_report_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../../app/lambdas/process_report"
  output_path = "/tmp/process_report.zip"
}

resource "aws_lambda_function" "process_report" {
  function_name    = "${var.project_name}-process-report-${var.environment}"
  role             = aws_iam_role.lambda_process_report_role.arn
  runtime          = local.lambda_runtime
  handler          = "handler.lambda_handler"
  filename         = data.archive_file.process_report_zip.output_path
  source_code_hash = data.archive_file.process_report_zip.output_base64sha256
  timeout          = var.lambda_timeout
  memory_size      = var.lambda_memory_mb
  environment { variables = local.lambda_env }
}

resource "aws_lambda_event_source_mapping" "sqs_to_process_report" {
  event_source_arn = aws_sqs_queue.reports_queue.arn
  function_name    = aws_lambda_function.process_report.arn
  batch_size       = 1
}

# ── notify_user ────────────────────────────────────────────────────────────
data "archive_file" "notify_user_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../../app/lambdas/notify_user"
  output_path = "/tmp/notify_user.zip"
}

resource "aws_lambda_function" "notify_user" {
  function_name    = "${var.project_name}-notify-user-${var.environment}"
  role             = aws_iam_role.lambda_notify_user_role.arn
  runtime          = local.lambda_runtime
  handler          = "handler.lambda_handler"
  filename         = data.archive_file.notify_user_zip.output_path
  source_code_hash = data.archive_file.notify_user_zip.output_base64sha256
  timeout          = 30
  memory_size      = 256
  environment { variables = local.lambda_env }
}
