# ── Secrets Manager — credenciais RDS ─────────────────────────────────────
resource "aws_secretsmanager_secret" "rds_credentials" {
  name                    = "${var.project_name}/rds/${var.environment}/credentials"
  recovery_window_in_days = 7
}

resource "aws_secretsmanager_secret_version" "rds_credentials" {
  secret_id = aws_secretsmanager_secret.rds_credentials.id
  secret_string = jsonencode({
    username = var.rds_username
    password = random_password.rds.result
    engine   = "postgres"
    host     = aws_db_instance.main.address
    port     = 5432
    dbname   = var.rds_db_name
  })
  depends_on = [aws_db_instance.main]
}

resource "random_password" "rds" {
  length           = 32
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

# ── RDS Parameter Group ────────────────────────────────────────────────────
resource "aws_db_parameter_group" "postgres" {
  name   = "${var.project_name}-pg16-${var.environment}"
  family = "postgres16"

  parameter { name = "log_connections";         value = "1" }
  parameter { name = "log_disconnections";      value = "1" }
  parameter { name = "log_duration";            value = "1" }
  parameter { name = "log_min_duration_statement"; value = "1000" }  # Log queries > 1s
  parameter { name = "shared_preload_libraries";   value = "pg_stat_statements" }
  parameter { name = "track_activity_query_size";  value = "4096" }
}

# ── RDS PostgreSQL Multi-AZ ────────────────────────────────────────────────
resource "aws_db_instance" "main" {
  identifier     = "${var.project_name}-rds-${var.environment}"
  engine         = "postgres"
  engine_version = "16.3"
  instance_class = var.rds_instance_class

  # Armazenamento com autoscaling
  allocated_storage     = var.rds_allocated_storage_gb
  max_allocated_storage = var.rds_max_allocated_storage_gb
  storage_type          = "gp3"
  storage_encrypted     = true

  # Credenciais
  db_name  = var.rds_db_name
  username = var.rds_username
  password = random_password.rds.result

  # Alta disponibilidade
  multi_az               = var.environment == "prod"
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  # Parâmetros e monitoramento
  parameter_group_name          = aws_db_parameter_group.postgres.name
  monitoring_interval           = 60  # Enhanced Monitoring a cada 60s
  monitoring_role_arn           = aws_iam_role.rds_monitoring.arn
  performance_insights_enabled  = true
  performance_insights_retention_period = 7

  # Backups
  backup_retention_period = 14        # 14 dias de backups automáticos
  backup_window           = "03:00-04:00"
  maintenance_window      = "sun:04:00-sun:05:00"
  copy_tags_to_snapshot   = true

  # Proteção
  deletion_protection      = var.environment == "prod"
  skip_final_snapshot      = var.environment != "prod"
  final_snapshot_identifier = "${var.project_name}-final-${var.environment}"
  publicly_accessible      = false

  tags = { Name = "${var.project_name}-rds-${var.environment}" }
}

# ── Read Replica (produção) ────────────────────────────────────────────────
resource "aws_db_instance" "read_replica" {
  count = var.environment == "prod" ? 1 : 0

  identifier             = "${var.project_name}-rds-replica-${var.environment}"
  replicate_source_db    = aws_db_instance.main.identifier
  instance_class         = var.rds_instance_class
  storage_encrypted      = true
  publicly_accessible    = false
  vpc_security_group_ids = [aws_security_group.rds.id]
  skip_final_snapshot    = true

  tags = { Name = "${var.project_name}-rds-replica-${var.environment}" }
}

# ── IAM Role para Enhanced Monitoring ─────────────────────────────────────
resource "aws_iam_role" "rds_monitoring" {
  name = "${var.project_name}-rds-monitoring-${var.environment}"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{ Effect = "Allow", Principal = { Service = "monitoring.rds.amazonaws.com" }, Action = "sts:AssumeRole" }]
  })
}

resource "aws_iam_role_policy_attachment" "rds_monitoring" {
  role       = aws_iam_role.rds_monitoring.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
}

# ── CloudWatch Alarms RDS ──────────────────────────────────────────────────
resource "aws_cloudwatch_metric_alarm" "rds_cpu" {
  alarm_name          = "${var.project_name}-rds-cpu-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "CPU do RDS acima de 80%"
  dimensions          = { DBInstanceIdentifier = aws_db_instance.main.identifier }
}

resource "aws_cloudwatch_metric_alarm" "rds_storage" {
  alarm_name          = "${var.project_name}-rds-storage-${var.environment}"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 1
  metric_name         = "FreeStorageSpace"
  namespace           = "AWS/RDS"
  period              = 300
  statistic           = "Average"
  threshold           = 10737418240  # 10 GB em bytes
  alarm_description   = "Espaço livre no RDS abaixo de 10 GB"
  dimensions          = { DBInstanceIdentifier = aws_db_instance.main.identifier }
}

output "rds_endpoint"        { value = aws_db_instance.main.address; sensitive = true }
output "rds_secret_arn"      { value = aws_secretsmanager_secret.rds_credentials.arn }
output "rds_instance_id"     { value = aws_db_instance.main.identifier }
