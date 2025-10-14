# Cdw-Spm: Variables Terraform SPYMEO V1

# ══════════════════════════════════════════════════════════════════
# GENERAL
# ══════════════════════════════════════════════════════════════════

variable "aws_region" {
  description = "AWS region (eu-west-3 for Paris)"
  type        = string
  default     = "eu-west-3"
}

variable "environment" {
  description = "Environment name (staging, production)"
  type        = string
  validation {
    condition     = contains(["staging", "production"], var.environment)
    error_message = "Environment must be staging or production"
  }
}

variable "domain_name" {
  description = "Domain name for the application"
  type        = string
}

variable "certificate_arn" {
  description = "ACM certificate ARN for HTTPS"
  type        = string
}

# ══════════════════════════════════════════════════════════════════
# NETWORKING
# ══════════════════════════════════════════════════════════════════

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "Availability zones"
  type        = list(string)
  default     = ["eu-west-3a", "eu-west-3b", "eu-west-3c"]
}

variable "public_subnets" {
  description = "Public subnet CIDR blocks"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
}

variable "private_subnets" {
  description = "Private subnet CIDR blocks"
  type        = list(string)
  default     = ["10.0.11.0/24", "10.0.12.0/24", "10.0.13.0/24"]
}

# ══════════════════════════════════════════════════════════════════
# DATABASE
# ══════════════════════════════════════════════════════════════════

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "spymeo"
}

variable "db_username" {
  description = "Database master username"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "Database master password"
  type        = string
  sensitive   = true
}

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t4g.medium"
}

variable "db_allocated_storage" {
  description = "Initial allocated storage in GB"
  type        = number
  default     = 50
}

variable "db_max_allocated_storage" {
  description = "Maximum allocated storage for autoscaling"
  type        = number
  default     = 200
}

# ══════════════════════════════════════════════════════════════════
# ECS / APPLICATION
# ══════════════════════════════════════════════════════════════════

variable "container_image" {
  description = "Docker image for the application"
  type        = string
  default     = "spymeo/app:latest"
}

variable "ecs_task_cpu" {
  description = "ECS task CPU units"
  type        = number
  default     = 512
}

variable "ecs_task_memory" {
  description = "ECS task memory in MB"
  type        = number
  default     = 1024
}

variable "ecs_desired_count" {
  description = "Desired number of ECS tasks"
  type        = number
  default     = 2
}

# ══════════════════════════════════════════════════════════════════
# SECRETS
# ══════════════════════════════════════════════════════════════════

variable "nextauth_secret" {
  description = "NextAuth.js secret for JWT signing"
  type        = string
  sensitive   = true
}

# ══════════════════════════════════════════════════════════════════
# MONITORING
# ══════════════════════════════════════════════════════════════════

variable "alert_emails" {
  description = "Email addresses for CloudWatch alerts"
  type        = list(string)
  default     = []
}
