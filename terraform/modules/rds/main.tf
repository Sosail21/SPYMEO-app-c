# Cdw-Spm: Module RDS PostgreSQL SPYMEO

# ══════════════════════════════════════════════════════════════════
# SECURITY GROUP
# ══════════════════════════════════════════════════════════════════

resource "aws_security_group" "rds" {
  name        = "spymeo-${var.environment}-rds-sg"
  description = "Security group for RDS"
  vpc_id      = var.vpc_id

  ingress {
    description = "PostgreSQL from private subnets"
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }

  egress {
    description = "Allow all outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "spymeo-${var.environment}-rds-sg"
  }
}

# ══════════════════════════════════════════════════════════════════
# DB SUBNET GROUP
# ══════════════════════════════════════════════════════════════════

resource "aws_db_subnet_group" "main" {
  name       = "spymeo-${var.environment}-db-subnet"
  subnet_ids = var.database_subnets

  tags = {
    Name = "spymeo-${var.environment}-db-subnet-group"
  }
}

# ══════════════════════════════════════════════════════════════════
# DB PARAMETER GROUP
# ══════════════════════════════════════════════════════════════════

resource "aws_db_parameter_group" "main" {
  name   = "spymeo-${var.environment}-pg15"
  family = "postgres15"

  parameter {
    name  = "log_connections"
    value = "1"
  }

  parameter {
    name  = "log_disconnections"
    value = "1"
  }

  parameter {
    name  = "log_checkpoints"
    value = "1"
  }

  parameter {
    name  = "log_lock_waits"
    value = "1"
  }

  parameter {
    name  = "shared_preload_libraries"
    value = "pg_stat_statements"
  }

  tags = {
    Name = "spymeo-${var.environment}-pg15-params"
  }
}

# ══════════════════════════════════════════════════════════════════
# KMS KEY for encryption
# ══════════════════════════════════════════════════════════════════

resource "aws_kms_key" "rds" {
  description             = "KMS key for RDS encryption"
  deletion_window_in_days = 30
  enable_key_rotation     = true

  tags = {
    Name = "spymeo-${var.environment}-rds-kms"
  }
}

resource "aws_kms_alias" "rds" {
  name          = "alias/spymeo-${var.environment}-rds"
  target_key_id = aws_kms_key.rds.key_id
}

# ══════════════════════════════════════════════════════════════════
# RDS INSTANCE
# ══════════════════════════════════════════════════════════════════

resource "aws_db_instance" "main" {
  identifier = "spymeo-${var.environment}-db"

  # Engine
  engine               = "postgres"
  engine_version       = "15"
  instance_class       = var.instance_class
  allocated_storage    = var.allocated_storage
  max_allocated_storage = var.max_allocated_storage
  storage_type         = "gp3"
  storage_encrypted    = var.storage_encrypted
  kms_key_id           = var.storage_encrypted ? aws_kms_key.rds.arn : null

  # Database
  db_name  = var.db_name
  username = var.db_username
  password = var.db_password
  port     = 5432

  # Network
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  publicly_accessible    = false
  multi_az               = var.multi_az

  # Backup
  backup_retention_period = var.backup_retention_period
  backup_window           = var.backup_window
  maintenance_window      = var.maintenance_window
  skip_final_snapshot     = var.environment != "production"
  final_snapshot_identifier = var.environment == "production" ? "spymeo-${var.environment}-final-snapshot-${formatdate("YYYY-MM-DD-hhmm", timestamp())}" : null
  copy_tags_to_snapshot   = true

  # Monitoring
  enabled_cloudwatch_logs_exports = var.enabled_cloudwatch_logs_exports
  performance_insights_enabled    = var.performance_insights_enabled
  performance_insights_retention_period = var.performance_insights_enabled ? 7 : null

  # Parameter group
  parameter_group_name = aws_db_parameter_group.main.name

  # Deletion protection
  deletion_protection = var.deletion_protection

  # Auto minor version upgrade
  auto_minor_version_upgrade = true

  tags = {
    Name = "spymeo-${var.environment}-postgres"
  }

  lifecycle {
    ignore_changes = [
      password,
      final_snapshot_identifier
    ]
  }
}

# ══════════════════════════════════════════════════════════════════
# CLOUDWATCH ALARMS
# ══════════════════════════════════════════════════════════════════

resource "aws_cloudwatch_metric_alarm" "database_cpu" {
  alarm_name          = "spymeo-${var.environment}-rds-cpu-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "RDS CPU utilization is too high"

  dimensions = {
    DBInstanceIdentifier = aws_db_instance.main.id
  }
}

resource "aws_cloudwatch_metric_alarm" "database_storage" {
  alarm_name          = "spymeo-${var.environment}-rds-storage-low"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 1
  metric_name         = "FreeStorageSpace"
  namespace           = "AWS/RDS"
  period              = 300
  statistic           = "Average"
  threshold           = 10737418240 # 10 GB in bytes
  alarm_description   = "RDS free storage space is low"

  dimensions = {
    DBInstanceIdentifier = aws_db_instance.main.id
  }
}

resource "aws_cloudwatch_metric_alarm" "database_connections" {
  alarm_name          = "spymeo-${var.environment}-rds-connections-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "DatabaseConnections"
  namespace           = "AWS/RDS"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "RDS database connections are too high"

  dimensions = {
    DBInstanceIdentifier = aws_db_instance.main.id
  }
}
