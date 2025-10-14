# Cdw-Spm: Variables module CloudFront

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "domain_name" {
  description = "Domain name for the distribution"
  type        = string
}

variable "certificate_arn" {
  description = "ACM certificate ARN (must be in us-east-1)"
  type        = string
}

variable "alb_domain_name" {
  description = "ALB domain name"
  type        = string
}

variable "s3_bucket_domain" {
  description = "S3 bucket domain name"
  type        = string
}

variable "s3_bucket_id" {
  description = "S3 bucket ID"
  type        = string
}

variable "default_ttl" {
  description = "Default TTL for cached objects"
  type        = number
  default     = 86400
}

variable "max_ttl" {
  description = "Maximum TTL for cached objects"
  type        = number
  default     = 31536000
}

variable "min_ttl" {
  description = "Minimum TTL for cached objects"
  type        = number
  default     = 0
}

variable "enable_waf" {
  description = "Enable WAF"
  type        = bool
  default     = false
}
