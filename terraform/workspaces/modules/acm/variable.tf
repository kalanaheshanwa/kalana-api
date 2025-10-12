variable "env" {
  description = "Environment"
  type        = string
}

variable "project_namespace" {
  description = "Namespace for the project"
  type        = string
}

variable "domain_apex" {
  description = "Apex/root domain (e.g., kalanah.lk)"
  type        = string
}

variable "subdomain_api" {
  description = "Subdomain label for the API (e.g., 'api')"
  type        = string
}

variable "route53_zone_id" {
  type        = string
  description = "Route53 zone id"
}
