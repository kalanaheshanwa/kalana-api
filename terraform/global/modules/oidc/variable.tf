variable "project_namespace" {
  description = "A short name for tagging/role naming"
  type        = string
}

variable "github_owner" {
  description = "GitHub org/user, e.g. 'amwpcn'"
  type        = string
}

variable "github_repo" {
  description = "Repo name only, e.g. 'puzzleon-web'"
  type        = string
}
