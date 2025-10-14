# Cdw-Spm: Variables module S3

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "bucket_name" {
  description = "S3 bucket name"
  type        = string
}

variable "enable_versioning" {
  description = "Enable versioning"
  type        = bool
  default     = true
}

variable "enable_encryption" {
  description = "Enable encryption"
  type        = bool
  default     = true
}

variable "enable_logging" {
  description = "Enable logging"
  type        = bool
  default     = false
}

variable "logging_bucket" {
  description = "Bucket for access logs"
  type        = string
  default     = ""
}

variable "cloudfront_oai_arn" {
  description = "CloudFront Origin Access Identity ARN"
  type        = string
  default     = ""
}

variable "cors_rules" {
  description = "List of CORS rules"
  type = list(object({
    allowed_headers = list(string)
    allowed_methods = list(string)
    allowed_origins = list(string)
    expose_headers  = optional(list(string))
    max_age_seconds = optional(number)
  }))
  default = []
}

variable "lifecycle_rules" {
  description = "List of lifecycle rules"
  type = list(object({
    id      = string
    enabled = bool
    transition = optional(list(object({
      days          = number
      storage_class = string
    })))
    expiration = optional(object({
      days = number
    }))
    noncurrent_version_transition = optional(list(object({
      days          = number
      storage_class = string
    })))
    noncurrent_version_expiration = optional(object({
      days = number
    }))
  }))
  default = []
}
