# Cdw-Spm: Infrastructure as Code SPYMEO V1
# AWS eu-west-3 (Paris) - HDS-compliant

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Backend S3 pour le state (à configurer après création bucket)
  # backend "s3" {
  #   bucket         = "spymeo-terraform-state"
  #   key            = "prod/terraform.tfstate"
  #   region         = "eu-west-3"
  #   encrypt        = true
  #   dynamodb_table = "terraform-state-lock"
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "SPYMEO"
      Environment = var.environment
      ManagedBy   = "Terraform"
      Compliance  = "HDS-like"
    }
  }
}

# ══════════════════════════════════════════════════════════════════
# NETWORKING - VPC avec sous-réseaux publics/privés
# ══════════════════════════════════════════════════════════════════

module "vpc" {
  source = "./modules/vpc"

  environment         = var.environment
  vpc_cidr            = var.vpc_cidr
  availability_zones  = var.availability_zones
  public_subnets      = var.public_subnets
  private_subnets     = var.private_subnets
  enable_nat_gateway  = true
  enable_vpn_gateway  = false
}

# ══════════════════════════════════════════════════════════════════
# DATABASE - RDS PostgreSQL 15+ avec chiffrement at-rest
# ══════════════════════════════════════════════════════════════════

module "rds" {
  source = "./modules/rds"

  environment             = var.environment
  vpc_id                  = module.vpc.vpc_id
  database_subnets        = module.vpc.private_subnets

  db_name                 = var.db_name
  db_username             = var.db_username
  db_password             = var.db_password

  instance_class          = var.db_instance_class
  allocated_storage       = var.db_allocated_storage
  max_allocated_storage   = var.db_max_allocated_storage

  backup_retention_period = 30
  backup_window           = "03:00-04:00"
  maintenance_window      = "Mon:04:00-Mon:05:00"

  multi_az                = var.environment == "production"
  storage_encrypted       = true
  deletion_protection     = var.environment == "production"

  # HDS compliance
  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]
  performance_insights_enabled    = true
}

# ══════════════════════════════════════════════════════════════════
# ECS FARGATE - Application Next.js
# ══════════════════════════════════════════════════════════════════

module "ecs" {
  source = "./modules/ecs"

  environment            = var.environment
  vpc_id                 = module.vpc.vpc_id
  public_subnets         = module.vpc.public_subnets
  private_subnets        = module.vpc.private_subnets

  app_name               = "spymeo-app"
  app_port               = 3000

  container_image        = var.container_image
  task_cpu               = var.ecs_task_cpu
  task_memory            = var.ecs_task_memory
  desired_count          = var.ecs_desired_count

  # Environment variables pour l'app
  environment_variables = [
    {
      name  = "NODE_ENV"
      value = var.environment
    },
    {
      name  = "DATABASE_URL"
      value = "postgresql://${var.db_username}:${var.db_password}@${module.rds.db_endpoint}/${var.db_name}?schema=public"
    },
    {
      name  = "NEXTAUTH_URL"
      value = "https://${var.domain_name}"
    },
    {
      name  = "S3_BUCKET_NAME"
      value = module.s3.bucket_name
    }
  ]

  # Secrets depuis AWS Secrets Manager
  secrets = [
    {
      name      = "NEXTAUTH_SECRET"
      valueFrom = aws_secretsmanager_secret.nextauth_secret.arn
    }
  ]

  # Health check
  health_check_path      = "/api/health"
  health_check_interval  = 30
  health_check_timeout   = 5

  # ALB SSL certificate
  certificate_arn        = var.certificate_arn

  depends_on = [module.rds]
}

# ══════════════════════════════════════════════════════════════════
# S3 - Stockage assets statiques (images, documents, etc.)
# ══════════════════════════════════════════════════════════════════

module "s3" {
  source = "./modules/s3"

  environment         = var.environment
  bucket_name         = "spymeo-${var.environment}-assets"

  enable_versioning   = true
  enable_encryption   = true

  # HDS compliance: lifecycle policy
  lifecycle_rules = [
    {
      id      = "archive-old-documents"
      enabled = true

      transition = [
        {
          days          = 90
          storage_class = "STANDARD_IA"
        },
        {
          days          = 365
          storage_class = "GLACIER"
        }
      ]
    }
  ]

  # CORS pour uploads depuis le frontend
  cors_rules = [
    {
      allowed_headers = ["*"]
      allowed_methods = ["GET", "PUT", "POST", "DELETE"]
      allowed_origins = ["https://${var.domain_name}"]
      expose_headers  = ["ETag"]
      max_age_seconds = 3000
    }
  ]
}


# ══════════════════════════════════════════════════════════════════
# SECRETS MANAGER - Secrets applicatifs
# ══════════════════════════════════════════════════════════════════

resource "aws_secretsmanager_secret" "nextauth_secret" {
  name                    = "spymeo-${var.environment}-nextauth-secret"
  description             = "NextAuth.js secret for JWT signing"
  recovery_window_in_days = 30

  tags = {
    Name = "SPYMEO NextAuth Secret"
  }
}

resource "aws_secretsmanager_secret_version" "nextauth_secret" {
  secret_id     = aws_secretsmanager_secret.nextauth_secret.id
  secret_string = var.nextauth_secret
}

# ══════════════════════════════════════════════════════════════════
# CLOUDWATCH - Logs & Monitoring
# ══════════════════════════════════════════════════════════════════

resource "aws_cloudwatch_log_group" "app" {
  name              = "/ecs/spymeo-${var.environment}"
  retention_in_days = var.environment == "production" ? 365 : 30

  tags = {
    Name = "SPYMEO App Logs"
  }
}

# Alarms
resource "aws_cloudwatch_metric_alarm" "high_cpu" {
  alarm_name          = "spymeo-${var.environment}-high-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "This metric monitors ECS CPU utilization"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    ClusterName = module.ecs.cluster_name
    ServiceName = module.ecs.service_name
  }
}

resource "aws_cloudwatch_metric_alarm" "high_memory" {
  alarm_name          = "spymeo-${var.environment}-high-memory"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "MemoryUtilization"
  namespace           = "AWS/ECS"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "This metric monitors ECS memory utilization"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    ClusterName = module.ecs.cluster_name
    ServiceName = module.ecs.service_name
  }
}

# ══════════════════════════════════════════════════════════════════
# SNS - Alertes
# ══════════════════════════════════════════════════════════════════

resource "aws_sns_topic" "alerts" {
  name = "spymeo-${var.environment}-alerts"

  tags = {
    Name = "SPYMEO Alerts"
  }
}

resource "aws_sns_topic_subscription" "email_alerts" {
  count     = length(var.alert_emails)
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = var.alert_emails[count.index]
}


