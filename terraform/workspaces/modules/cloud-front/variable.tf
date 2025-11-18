variable "env" {
  type        = string
  description = "Environment"
}

variable "project_namespace" {
  type        = string
  description = "Namespace for the project"
}

variable "s3_frontend_id" {
  type        = string
  description = "Id of the s3 bucket for frontend"
}

variable "s3_frontend_bucket_regional_domain_name" {
  type        = string
  description = "Regional domain name of the s3 bucket for frontend"
}

variable "s3_uploads_id" {
  type        = string
  description = "Id of the s3 bucket for uploads"
}

variable "s3_uploads_bucket_regional_domain_name" {
  type        = string
  description = "Regional domain name of the s3 bucket for uploads"
}

variable "acm_certificate_frontend_arn" {
  type        = string
  description = "ARN of the frontend certificate"
}

variable "domain_frontend_aliases" {
  type        = list(string)
  description = "Domain frontend aliases"
}

variable "route53_zone_id" {
  type        = string
  description = "Route53 zone id"
}
