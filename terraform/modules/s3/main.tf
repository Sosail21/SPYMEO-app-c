# Cdw-Spm: Module S3 SPYMEO

# ══════════════════════════════════════════════════════════════════
# S3 BUCKET
# ══════════════════════════════════════════════════════════════════

resource "aws_s3_bucket" "assets" {
  bucket = var.bucket_name

  tags = {
    Name = var.bucket_name
  }
}

# ══════════════════════════════════════════════════════════════════
# VERSIONING
# ══════════════════════════════════════════════════════════════════

resource "aws_s3_bucket_versioning" "assets" {
  bucket = aws_s3_bucket.assets.id

  versioning_configuration {
    status = var.enable_versioning ? "Enabled" : "Suspended"
  }
}

# ══════════════════════════════════════════════════════════════════
# ENCRYPTION
# ══════════════════════════════════════════════════════════════════

#resource "aws_s3_bucket_server_side_encryption_configuration" "assets" {
 # bucket = aws_s3_bucket.assets.id

  #rule {
   # apply_server_side_encryption_by_default {
   #   sse_algorithm = "AES256"
   # }
  #  bucket_key_enabled = true
  #}
#}

# ══════════════════════════════════════════════════════════════════
# PUBLIC ACCESS BLOCK
# ══════════════════════════════════════════════════════════════════

#resource "aws_s3_bucket_public_access_block" "assets" {
 # bucket = aws_s3_bucket.assets.id

#  block_public_acls       = true
#  block_public_policy     = true
#  ignore_public_acls      = true
#  restrict_public_buckets = true
#}

# ══════════════════════════════════════════════════════════════════
# CORS CONFIGURATION
# ══════════════════════════════════════════════════════════════════

resource "aws_s3_bucket_cors_configuration" "assets" {
  count  = length(var.cors_rules) > 0 ? 1 : 0
  bucket = aws_s3_bucket.assets.id

  dynamic "cors_rule" {
    for_each = var.cors_rules
    content {
      allowed_headers = cors_rule.value.allowed_headers
      allowed_methods = cors_rule.value.allowed_methods
      allowed_origins = cors_rule.value.allowed_origins
      expose_headers  = try(cors_rule.value.expose_headers, [])
      max_age_seconds = try(cors_rule.value.max_age_seconds, 3000)
    }
  }
}

# ══════════════════════════════════════════════════════════════════
# BUCKET POLICY for CloudFront OAI
# ══════════════════════════════════════════════════════════════════

#resource "aws_s3_bucket_policy" "assets" {
#  bucket = aws_s3_bucket.assets.id

#  policy = jsonencode({
#    Version = "2012-10-17"
#    Statement = [
#      {
#        Sid    = "AllowCloudFrontOAI"
#        Effect = "Allow"
#        Principal = {
#          AWS = var.cloudfront_oai_arn != "" ? var.cloudfront_oai_arn : "*"
#        }
#        Action   = "s3:GetObject"
#        Resource = "${aws_s3_bucket.assets.arn}/*"
#      }
#    ]
#  })

#  depends_on = [aws_s3_bucket_public_access_block.assets]
#}

# ══════════════════════════════════════════════════════════════════
# LOGGING
# ══════════════════════════════════════════════════════════════════

resource "aws_s3_bucket_logging" "assets" {
  count  = var.enable_logging ? 1 : 0
  bucket = aws_s3_bucket.assets.id

  target_bucket = var.logging_bucket != "" ? var.logging_bucket : aws_s3_bucket.assets.id
  target_prefix = "logs/"
}
