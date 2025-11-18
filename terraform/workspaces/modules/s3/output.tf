output "frontend_id" {
  value = aws_s3_bucket.frontend.id
}

output "frontend_bucket_regional_domain_name" {
  value = aws_s3_bucket.frontend.bucket_regional_domain_name
}

output "uploads_id" {
  value = aws_s3_bucket.uploads.id
}

output "uploads_bucket_regional_domain_name" {
  value = aws_s3_bucket.uploads.bucket_regional_domain_name
}
