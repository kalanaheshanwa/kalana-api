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

variable "v_api" {
  description = "API image version/tag"
  type        = string
}

variable "cognito_callback_urls" {
  type        = list(string)
  description = "List of allowed callback urls"
}

variable "cognito_logout_urls" {
  type        = list(string)
  description = "List of allowed logout urls"
}

variable "cognito_super_admin_username" {
  type        = string
  description = "Username of the super admin"
}

variable "cognito_super_admin_password" {
  type        = string
  description = "Password of the super admin"
}

# lambda env
variable "NODE_ENV" {
  type        = string
  description = "Lambda env variable NODE_ENV"
}
variable "CORS_ALLOWED_ORIGINS" {
  type        = string
  description = "Lambda env variable CORS_ALLOWED_ORIGINS"
}
variable "POSTGRES_DB" {
  type        = string
  description = "Lambda env variable POSTGRES_DB"
}
variable "POSTGRES_PORT" {
  type        = string
  description = "Lambda env variable POSTGRES_PORT"
}
variable "POSTGRES_HOST" {
  type        = string
  description = "Lambda env variable POSTGRES_HOST"
}
variable "APP_USER" {
  type        = string
  description = "Lambda env variable APP_USER"
}
variable "APP_AWS_DB_REGION" {
  type        = string
  description = "Lambda env variable APP_AWS_DB_REGION"
}
variable "APP_AWS_REGION" {
  type        = string
  description = "Lambda env variable APP_AWS_REGION"
}
