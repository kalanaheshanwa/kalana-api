variable "env" {
  type        = string
  description = "Environment"
}

variable "project_namespace" {
  type        = string
  description = "Namespace for the project"
}

variable "lambda_main_invoke_arn" {
  type        = string
  description = "Arn for the main lambda function"
}

variable "lambda_main_function_name" {
  type        = string
  description = "Function name for the main lambda function"
}

variable "acm_certificate_api_arn" {
  type        = string
  description = "ARN of the api certificate"
}

variable "domain_api" {
  type        = string
  description = "Domain frontend aliases"
}

variable "route53_zone_id" {
  type        = string
  description = "Route53 zone id"
}
