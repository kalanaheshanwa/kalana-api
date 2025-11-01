resource "aws_dsql_cluster" "main" {
  deletion_protection_enabled = true

  tags = {
    Name = "kalanah-dev"
  }
}