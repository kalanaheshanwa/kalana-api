variable "env" {
  type        = string
  description = "Environment"
}

variable "project_namespace" {
  type        = string
  description = "Namespace for the project"
}

variable "cloudfront_frontend_arn" {
  type        = string
  description = "ARN for the cloud front frontend distribution"
}
