# ─── Fila principal de relatórios ───────────────────────────────────────────
resource "aws_sqs_queue" "reports_dlq" {
  name                       = "${var.project_name}-reports-dlq-${var.environment}"
  message_retention_seconds  = 1209600 # 14 dias
}

resource "aws_sqs_queue" "reports_queue" {
  name                        = "${var.project_name}-reports-${var.environment}"
  visibility_timeout_seconds  = var.sqs_visibility_timeout
  message_retention_seconds   = 86400 # 1 dia
  receive_wait_time_seconds   = 10    # Long polling

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.reports_dlq.arn
    maxReceiveCount     = 3
  })
}

# Permissão para a Lambda de request publicar na fila
resource "aws_sqs_queue_policy" "reports_queue_policy" {
  queue_url = aws_sqs_queue.reports_queue.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "AllowLambdaRequestReport"
        Effect    = "Allow"
        Principal = { AWS = aws_iam_role.lambda_request_report_role.arn }
        Action    = "sqs:SendMessage"
        Resource  = aws_sqs_queue.reports_queue.arn
      }
    ]
  })
}

output "reports_queue_url" {
  value = aws_sqs_queue.reports_queue.url
}

output "reports_queue_arn" {
  value = aws_sqs_queue.reports_queue.arn
}
