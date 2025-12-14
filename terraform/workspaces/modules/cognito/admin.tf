data "aws_region" "current" {}

resource "aws_cognito_user_pool" "admin" {
  name                     = "${var.project_namespace}_admin_${var.environment}"
  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]
  region                   = data.aws_region.current.region

  admin_create_user_config {
    allow_admin_create_user_only = true

    invite_message_template {
      email_message = "Your username is {username} and temporary password is {####}"
      email_subject = "Puzzleon New Account"
      sms_message   = "Puzzleon: Your username is {username} and temporary password is {####}"
    }
  }

  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_uppercase = true
    require_symbols   = true
    require_numbers   = true

    temporary_password_validity_days = 3
  }

  schema {
    name                = "given_name"
    attribute_data_type = "String"
    required            = true
  }

  schema {
    name                = "family_name"
    attribute_data_type = "String"
    required            = true
  }

  email_configuration {
    email_sending_account = "COGNITO_DEFAULT"
  }

  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  sign_in_policy {
    allowed_first_auth_factors = ["PASSWORD", "WEB_AUTHN"]
  }
}

resource "aws_cognito_user_pool_client" "web" {
  name = "web"

  user_pool_id                         = aws_cognito_user_pool.admin.id
  allowed_oauth_flows_user_pool_client = true
  callback_urls                        = var.callback_urls
  logout_urls                          = var.logout_urls
  allowed_oauth_flows                  = ["code"]
  allowed_oauth_scopes                 = ["email", "openid", "profile"]
  supported_identity_providers         = ["COGNITO"]
  generate_secret                      = false
  explicit_auth_flows                  = ["ALLOW_USER_AUTH", "ALLOW_USER_SRP_AUTH", "ALLOW_REFRESH_TOKEN_AUTH"]
  prevent_user_existence_errors        = "ENABLED"

  auth_session_validity  = 3 # 3 minutes
  refresh_token_validity = 5 # 5 days
  access_token_validity  = 1 # 1 hour
  id_token_validity      = 1 # 1 hour

  token_validity_units {
    access_token  = "hours"
    id_token      = "hours"
    refresh_token = "days"
  }
}

resource "aws_cognito_user_pool_client" "cli" {
  name = "cli"

  user_pool_id                         = aws_cognito_user_pool.admin.id
  allowed_oauth_flows_user_pool_client = true
  callback_urls                        = var.callback_urls
  logout_urls                          = var.logout_urls
  allowed_oauth_flows                  = ["code", "implicit"]
  allowed_oauth_scopes                 = ["email", "openid", "profile"]
  supported_identity_providers         = ["COGNITO"]
  generate_secret                      = false
  explicit_auth_flows                  = ["ALLOW_USER_PASSWORD_AUTH", "ALLOW_REFRESH_TOKEN_AUTH"]
  prevent_user_existence_errors        = "ENABLED"

  auth_session_validity  = 3 # 3 minutes
  refresh_token_validity = 5 # 5 days
  access_token_validity  = 1 # 1 hour
  id_token_validity      = 1 # 1 hour

  token_validity_units {
    access_token  = "hours"
    id_token      = "hours"
    refresh_token = "days"
  }
}

resource "aws_cognito_user_pool_domain" "admin" {
  domain                = "${var.project_namespace}-admin-${var.environment}"
  user_pool_id          = aws_cognito_user_pool.admin.id
  managed_login_version = 2
}

resource "aws_cognito_user" "super_admin" {
  user_pool_id       = aws_cognito_user_pool.admin.id
  username           = var.super_admin_username
  temporary_password = var.super_admin_password
  message_action     = "SUPPRESS"

  attributes = {
    email          = var.super_admin_username
    email_verified = true
    given_name     = "Super"
    family_name    = "Admin"
  }
}
