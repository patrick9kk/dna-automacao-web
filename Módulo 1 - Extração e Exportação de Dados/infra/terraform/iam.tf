# ── Role: Lambda request_report ────────────────────────────────────────────
resource "aws_iam_role" "lambda_request_report_role" {
  name = "${var.project_name}-request-report-role-${var.environment}"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{ Effect = "Allow", Principal = { Service = "lambda.amazonaws.com" }, Action = "sts:AssumeRole" }]
  })
}

resource "aws_iam_role_policy" "lambda_request_report_policy" {
  name = "request-report-policy"
  role = aws_iam_role.lambda_request_report_role.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      { Effect = "Allow", Action = ["sqs:SendMessage"], Resource = aws_sqs_queue.reports_queue.arn },
      { Effect = "Allow", Action = ["logs:CreateLogGroup","logs:CreateLogStream","logs:PutLogEvents"], Resource = "arn:aws:logs:*:*:*" }
    ]
  })
}

# ── Role: Lambda process_report ────────────────────────────────────────────
resource "aws_iam_role" "lambda_process_report_role" {
  name = "${var.project_name}-process-report-role-${var.environment}"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{ Effect = "Allow", Principal = { Service = "lambda.amazonaws.com" }, Action = "sts:AssumeRole" }]
  })
}

resource "aws_iam_role_policy" "lambda_process_report_policy" {
  name = "process-report-policy"
  role = aws_iam_role.lambda_process_report_role.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      { Effect = "Allow", Action = ["sqs:ReceiveMessage","sqs:DeleteMessage","sqs:GetQueueAttributes"], Resource = aws_sqs_queue.reports_queue.arn },
      { Effect = "Allow", Action = ["s3:PutObject","s3:GetObject"], Resource = "${aws_s3_bucket.reports.arn}/*" },
      { Effect = "Allow", Action = ["rds-db:connect"], Resource = "*" },
      { Effect = "Allow", Action = ["logs:CreateLogGroup","logs:CreateLogStream","logs:PutLogEvents"], Resource = "arn:aws:logs:*:*:*" }
    ]
  })
}

# ── Role: Lambda notify_user ───────────────────────────────────────────────
resource "aws_iam_role" "lambda_notify_user_role" {
  name = "${var.project_name}-notify-user-role-${var.environment}"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{ Effect = "Allow", Principal = { Service = "lambda.amazonaws.com" }, Action = "sts:AssumeRole" }]
  })
}

resource "aws_iam_role_policy" "lambda_notify_user_policy" {
  name = "notify-user-policy"
  role = aws_iam_role.lambda_notify_user_role.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      { Effect = "Allow", Action = ["s3:GetObject"], Resource = "${aws_s3_bucket.reports.arn}/*" },
      { Effect = "Allow", Action = ["ses:SendEmail","ses:SendRawEmail"], Resource = "*" },
      { Effect = "Allow", Action = ["logs:CreateLogGroup","logs:CreateLogStream","logs:PutLogEvents"], Resource = "arn:aws:logs:*:*:*" }
    ]
  })
}
