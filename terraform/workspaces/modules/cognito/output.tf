output "admin_pool_id" {
  value = aws_cognito_user_pool.admin.id
}

output "admin_pool_client_id_web" {
  value = aws_cognito_user_pool_client.web.id
}

output "admin_pool_client_id_cli" {
  value = aws_cognito_user_pool_client.cli.id
}
