variable "environment" {
  type        = string
  description = "Environment"
}

variable "project_namespace" {
  type        = string
  description = "Namespace for the project"
}

variable "callback_urls" {
  type        = list(string)
  description = "List of allowed callback urls"
}

variable "logout_urls" {
  type        = list(string)
  description = "List of allowed logout urls"
}

variable "super_admin_username" {
  type        = string
  description = "Username of the super admin"
}

variable "super_admin_password" {
  type        = string
  description = "Password of the super admin"
}
