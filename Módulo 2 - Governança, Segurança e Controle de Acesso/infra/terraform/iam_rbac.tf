# ── Trust policy comum (Cognito → IAM) ────────────────────────────────────
data "aws_iam_policy_document" "cognito_trust" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]
    principals {
      type        = "Federated"
      identifiers = ["cognito-identity.amazonaws.com"]
    }
    condition {
      test     = "StringEquals"
      variable = "cognito-identity.amazonaws.com:aud"
      values   = [aws_cognito_user_pool.main.id]
    }
  }
}

# ── Role: Administrador ────────────────────────────────────────────────────
resource "aws_iam_role" "cognito_admin_role" {
  name               = "${var.project_name}-cognito-admin-${var.environment}"
  assume_role_policy = data.aws_iam_policy_document.cognito_trust.json
}

resource "aws_iam_role_policy" "admin_policy" {
  name = "admin-full-access"
  role = aws_iam_role.cognito_admin_role.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "DashboardFullAccess"
        Effect = "Allow"
        Action = [
          "s3:GetObject", "s3:PutObject", "s3:ListBucket",
          "cloudwatch:GetMetricData", "cloudwatch:ListMetrics",
          "logs:FilterLogEvents", "logs:GetLogEvents",
          "cognito-idp:AdminListGroupsForUser",
          "cognito-idp:AdminGetUser",
          "cognito-idp:AdminUpdateUserAttributes",
        ]
        Resource = "*"
      },
      {
        Sid    = "ReportExtractAll"
        Effect = "Allow"
        Action = ["lambda:InvokeFunction"]
        Resource = "arn:aws:lambda:*:*:function:${var.project_name}-request-report-*"
      }
    ]
  })
}

# ── Role: Analista/Operador ────────────────────────────────────────────────
resource "aws_iam_role" "cognito_analyst_role" {
  name               = "${var.project_name}-cognito-analyst-${var.environment}"
  assume_role_policy = data.aws_iam_policy_document.cognito_trust.json
}

resource "aws_iam_role_policy" "analyst_policy" {
  name = "analyst-operational-access"
  role = aws_iam_role.cognito_analyst_role.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "DashboardRead"
        Effect = "Allow"
        Action = ["cloudwatch:GetMetricData", "cloudwatch:ListMetrics"]
        Resource = "*"
      },
      {
        Sid    = "ReportExtract"
        Effect = "Allow"
        Action = ["lambda:InvokeFunction"]
        Resource = "arn:aws:lambda:*:*:function:${var.project_name}-request-report-*"
      }
    ]
  })
}

# ── Role: Auditor (somente leitura logs) ───────────────────────────────────
resource "aws_iam_role" "cognito_auditor_role" {
  name               = "${var.project_name}-cognito-auditor-${var.environment}"
  assume_role_policy = data.aws_iam_policy_document.cognito_trust.json
}

resource "aws_iam_role_policy" "auditor_policy" {
  name = "auditor-readonly-logs"
  role = aws_iam_role.cognito_auditor_role.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AuditLogReadOnly"
        Effect = "Allow"
        Action = [
          "logs:FilterLogEvents", "logs:GetLogEvents",
          "logs:DescribeLogGroups", "logs:DescribeLogStreams",
          "s3:GetObject"
        ]
        Resource = [
          "arn:aws:logs:*:*:log-group:/dna-automacao/audit/*",
          "arn:aws:s3:::${var.project_name}-audit-*/*"
        ]
      },
      {
        Sid    = "DenyExtraction"
        Effect = "Deny"
        Action = ["lambda:InvokeFunction"]
        Resource = "*"
      }
    ]
  })
}

# ── Role: Lambda token_authorizer ──────────────────────────────────────────
resource "aws_iam_role" "lambda_token_authorizer_role" {
  name = "${var.project_name}-token-authorizer-role-${var.environment}"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{ Effect = "Allow", Principal = { Service = "lambda.amazonaws.com" }, Action = "sts:AssumeRole" }]
  })
}

resource "aws_iam_role_policy" "lambda_token_authorizer_policy" {
  name = "token-authorizer-policy"
  role = aws_iam_role.lambda_token_authorizer_role.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      { Effect = "Allow", Action = ["logs:CreateLogGroup","logs:CreateLogStream","logs:PutLogEvents"], Resource = "arn:aws:logs:*:*:*" },
      { Effect = "Allow", Action = ["cognito-idp:GetUser"], Resource = aws_cognito_user_pool.main.arn }
    ]
  })
}

# ── Role: Lambda audit_logger ──────────────────────────────────────────────
resource "aws_iam_role" "lambda_audit_logger_role" {
  name = "${var.project_name}-audit-logger-role-${var.environment}"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{ Effect = "Allow", Principal = { Service = "lambda.amazonaws.com" }, Action = "sts:AssumeRole" }]
  })
}

resource "aws_iam_role_policy" "lambda_audit_logger_policy" {
  name = "audit-logger-policy"
  role = aws_iam_role.lambda_audit_logger_role.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      { Effect = "Allow", Action = ["logs:CreateLogGroup","logs:CreateLogStream","logs:PutLogEvents","logs:DescribeLogGroups"], Resource = "arn:aws:logs:*:*:*" },
      { Effect = "Allow", Action = ["s3:PutObject"], Resource = "${aws_s3_bucket.audit_logs.arn}/*" },
      { Effect = "Allow", Action = ["sqs:ReceiveMessage","sqs:DeleteMessage","sqs:GetQueueAttributes"], Resource = aws_sqs_queue.audit_queue.arn }
    ]
  })
}
