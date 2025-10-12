terraform {
  required_providers {
    aws = {
      source                = "hashicorp/aws"
      version               = "~> 6.8"
      configuration_aliases = [aws.use1]
    }
  }
}