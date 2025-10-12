terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.8"
    }
  }

  backend "s3" {
    bucket               = "kalanah-tfstates"
    workspace_key_prefix = "kalanah"
    key                  = "terraform.tfstate"
    region               = "ap-southeast-1"
    profile              = "kalanah-dev"
  }
}

provider "aws" {
  region  = "us-east-1"
  profile = "kalanah-dev"

  default_tags {
    tags = {
      "terraform_managed"   = "yes"
      "terraform_workspace" = terraform.workspace
      "app_id"              = "kalanah"
    }
  }
}

provider "aws" {
  alias   = "use1"
  region  = "us-east-1"
  profile = "kalanah-dev"

  default_tags {
    tags = {
      "terraform_managed"   = "yes"
      "terraform_workspace" = terraform.workspace
      "app_id"              = "kalanah"
    }
  }
}

resource "terraform_data" "env_guard" {
  lifecycle {
    precondition {
      condition     = var.env == null || var.env == terraform.workspace
      error_message = "var.env must be null or match terraform workspace."
    }
  }
}
