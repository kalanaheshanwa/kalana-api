variable "env" {
  type        = string
  description = "Environment"
}

variable "project_namespace" {
  type        = string
  description = "Namespace for the project"
}

variable "v_api" {
  description = "API image version/tag"
  type        = string
}

variable "dsql_cluster_arn" {
  type        = string
  description = "ARN of the Aurora DSQL cluster for DbConnect permissions"
}

variable "dsql_connect_role_arn" {
  type        = string
  description = "ARN of the IAM role that has been granted Aurora DSQL DbConnect access"
}

variable "s3_uploads_arn" {
  type        = string
  description = "ARN of the S3 bucket for uploads"
}

variable "s3_uploads_id" {
  type        = string
  description = "Name/Id of the S3 bucket for uploads"
}

variable "cognito_admin_pool_id" {
  type        = string
  description = "Cognito user pool id"
}

variable "cognito_admin_pool_client_ids" {
  type        = list(string)
  description = "Cognito user pool client ids"
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
