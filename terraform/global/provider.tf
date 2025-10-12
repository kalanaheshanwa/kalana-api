terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.8"
    }
  }

  backend "s3" {
    bucket  = "kalanah-tfstates"
    key     = "terraform-global.tfstate"
    region  = "ap-southeast-1"
    profile = "kalanah-dev"
  }
}

provider "aws" {
  region  = "us-east-1"
  profile = "kalanah-dev"

  default_tags {
    tags = {
      "terraform_managed" = "yes"
      "terraform_global"  = "yes"
      "app_id" = "kalanah"
    }
  }
}
