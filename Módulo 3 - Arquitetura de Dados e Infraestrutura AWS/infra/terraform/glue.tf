# ── IAM Role para Glue ─────────────────────────────────────────────────────
resource "aws_iam_role" "glue_etl" {
  name = "${var.project_name}-glue-etl-role-${var.environment}"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{ Effect = "Allow", Principal = { Service = "glue.amazonaws.com" }, Action = "sts:AssumeRole" }]
  })
}

resource "aws_iam_role_policy_attachment" "glue_service" {
  role       = aws_iam_role.glue_etl.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSGlueServiceRole"
}

resource "aws_iam_role_policy" "glue_etl_custom" {
  name = "glue-etl-custom"
  role = aws_iam_role.glue_etl.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "S3DataLakeAccess"
        Effect = "Allow"
        Action = ["s3:GetObject","s3:PutObject","s3:DeleteObject","s3:ListBucket"]
        Resource = [
          aws_s3_bucket.datalake.arn,
          "${aws_s3_bucket.datalake.arn}/*",
          aws_s3_bucket.glue_scripts.arn,
          "${aws_s3_bucket.glue_scripts.arn}/*",
        ]
      },
      {
        Sid    = "SecretsManagerRDS"
        Effect = "Allow"
        Action = ["secretsmanager:GetSecretValue"]
        Resource = aws_secretsmanager_secret.rds_credentials.arn
      },
      {
        Sid    = "GlueCatalog"
        Effect = "Allow"
        Action = ["glue:*"]
        Resource = "*"
      }
    ]
  })
}

# ── S3 para scripts Glue ───────────────────────────────────────────────────
resource "aws_s3_bucket" "glue_scripts" {
  bucket        = "${var.project_name}-glue-scripts-${var.environment}"
  force_destroy = true
}

resource "aws_s3_bucket_public_access_block" "glue_scripts" {
  bucket                  = aws_s3_bucket.glue_scripts.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Upload do script Glue
resource "aws_s3_object" "glue_etl_script" {
  bucket = aws_s3_bucket.glue_scripts.bucket
  key    = "jobs/hot_to_cold_etl.py"
  source = "${path.module}/../../app/glue_jobs/hot_to_cold_etl.py"
  etag   = filemd5("${path.module}/../../app/glue_jobs/hot_to_cold_etl.py")
}

# ── Glue Database (Catálogo) ───────────────────────────────────────────────
resource "aws_glue_catalog_database" "dna_lake" {
  name        = "${replace(var.project_name,"-","_")}_lake_${var.environment}"
  description = "Catálogo do Data Lake DNA Automação"
}

# ── Glue Connection (JDBC → RDS) ──────────────────────────────────────────
resource "aws_glue_connection" "rds_postgres" {
  name = "${var.project_name}-rds-connection-${var.environment}"

  connection_properties = {
    JDBC_CONNECTION_URL = "jdbc:postgresql://${aws_db_instance.main.address}:5432/${var.rds_db_name}"
    USERNAME            = var.rds_username
    PASSWORD            = random_password.rds.result
  }

  physical_connection_requirements {
    availability_zone      = var.availability_zones[0]
    security_group_id_list = [aws_security_group.glue.id]
    subnet_id              = aws_subnet.private[0].id
  }
}

# ── Glue Job: hot → cold ETL ──────────────────────────────────────────────
resource "aws_glue_job" "hot_to_cold" {
  name     = "${var.project_name}-hot-to-cold-${var.environment}"
  role_arn = aws_iam_role.glue_etl.arn

  command {
    name            = "glueetl"
    script_location = "s3://${aws_s3_bucket.glue_scripts.bucket}/jobs/hot_to_cold_etl.py"
    python_version  = "3"
  }

  glue_version      = "4.0"
  worker_type       = "G.1X"
  number_of_workers = 2
  timeout           = 120  # minutos

  default_arguments = {
    "--RDS_SECRET_ARN"     = aws_secretsmanager_secret.rds_credentials.arn
    "--DATALAKE_BUCKET"    = aws_s3_bucket.datalake.bucket
    "--HOT_DATA_DAYS"      = tostring(var.hot_data_days)
    "--DATABASE_NAME"      = var.rds_db_name
    "--GLUE_DATABASE"      = aws_glue_catalog_database.dna_lake.name
    "--enable-metrics"     = "true"
    "--enable-glue-datacatalog" = "true"
    "--job-bookmark-option"     = "job-bookmark-enable"
    "--TempDir"            = "s3://${aws_s3_bucket.glue_scripts.bucket}/tmp/"
  }

  connections = [aws_glue_connection.rds_postgres.name]
}

# ── Glue Trigger: agendamento diário ──────────────────────────────────────
resource "aws_glue_trigger" "daily" {
  name     = "${var.project_name}-hot-to-cold-trigger-${var.environment}"
  type     = "SCHEDULED"
  schedule = var.glue_job_schedule

  actions { job_name = aws_glue_job.hot_to_cold.name }
}

# ── Glue Crawler (atualiza catálogo automaticamente) ──────────────────────
resource "aws_glue_crawler" "datalake" {
  name          = "${var.project_name}-datalake-crawler-${var.environment}"
  role          = aws_iam_role.glue_etl.arn
  database_name = aws_glue_catalog_database.dna_lake.name

  s3_target {
    path = "s3://${aws_s3_bucket.datalake.bucket}/automation-data/"
  }

  schedule      = "cron(0 4 * * ? *)"  # Após o ETL (2h) + 2h de buffer
  configuration = jsonencode({
    Version = 1.0
    CrawlerOutput = {
      Partitions = { AddOrUpdateBehavior = "InheritFromTable" }
    }
  })
}

output "glue_job_name"       { value = aws_glue_job.hot_to_cold.name }
output "glue_database_name"  { value = aws_glue_catalog_database.dna_lake.name }
output "glue_scripts_bucket" { value = aws_s3_bucket.glue_scripts.bucket }
