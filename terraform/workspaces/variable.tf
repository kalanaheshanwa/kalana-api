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
variable "APP_AWS_UPLOADS_S3_BUCKET_NAME" {
  type        = string
  description = "Lambda env variable APP_AWS_UPLOADS_S3_BUCKET_NAME"
}
