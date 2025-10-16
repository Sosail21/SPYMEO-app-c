variable "domain_name" {
  description = "Primary domain name for the certificate"
  type        = string
}

variable "subject_alternative_names" {
  description = "Additional domain names (SANs) for the certificate"
  type        = list(string)
  default     = []
}

variable "environment" {
  description = "Environment name"
  type        = string
}
