# Cdw-Spm: Outputs module S3

output "bucket_id" {
  description = "S3 bucket ID"
  value       = aws_s3_bucket.assets.id
}

output "bucket_name" {
  description = "S3 bucket name"
  value       = aws_s3_bucket.assets.bucket
}

output "bucket_arn" {
  description = "S3 bucket ARN"
  value       = aws_s3_bucket.assets.arn
}

output "bucket_domain_name" {
  description = "S3 bucket domain name"
  value       = aws_s3_bucket.assets.bucket_domain_name
}

output "bucket_regional_domain_name" {
  description = "S3 bucket regional domain name"
  value       = aws_s3_bucket.assets.bucket_regional_domain_name
}

output "bucket_region" {
  description = "S3 bucket region"
  value       = aws_s3_bucket.assets.region
}
