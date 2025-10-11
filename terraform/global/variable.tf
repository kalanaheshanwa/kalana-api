variable "project_namespace" {
  description = "Namespace for the project"
  type        = string
  default     = "kalanah"
}

variable "route53_domain_root" {
  type        = string
  description = "Primary domain name"
}
