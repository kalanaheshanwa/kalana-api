output "role_name" {
  value = aws_iam_role.dsql_role.name
}

output "role_arn" {
  value = aws_iam_role.dsql_role.arn
}

output "cluster_arn" {
  value = aws_dsql_cluster.main.arn
}
