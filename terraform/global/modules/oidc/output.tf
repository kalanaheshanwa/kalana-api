output "gha_role_arn" {
  description = "Role to assume from GitHub Actions"
  value       = aws_iam_role.gha_deploy_role.arn
}
