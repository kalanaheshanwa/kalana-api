variable "env" {
  type        = string
  description = "Environment"
}

variable "project_namespace" {
  type        = string
  description = "Namespace for the project"
}

variable "domain_apex" {
  type        = string
  description = "Apex/root domain name"
}

variable "subdomain_api" {
  description = "Subdomain label for the API (e.g., 'api')"
  type        = string
}