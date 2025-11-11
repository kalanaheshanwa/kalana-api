resource "aws_dsql_cluster" "main" {
  deletion_protection_enabled = true

  tags = {
    Name = "kalanah-${var.env}"
  }
}

data "aws_iam_role" "sso_power_user_role" {
  name = "AWSReservedSSO_PowerUserAccess_7c5e48e31e9cf8a4"
}

data "aws_caller_identity" "current" {}

data "aws_iam_policy_document" "dsql_role_assume_role_trust" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]

    principals {
      type = "AWS"
      identifiers = [
        data.aws_iam_role.sso_power_user_role.arn,
        "arn:aws:iam::${data.aws_caller_identity.current.account_id}:root",
      ]
    }
  }
}

data "aws_iam_policy_document" "dsql_connect" {
  statement {
    effect    = "Allow"
    actions   = ["dsql:DbConnect"]
    resources = [aws_dsql_cluster.main.arn]
  }
}

resource "aws_iam_role" "dsql_role" {
  name               = "dsql_connect_role_${var.env}"
  assume_role_policy = data.aws_iam_policy_document.dsql_role_assume_role_trust.json
}

resource "aws_iam_role_policy" "dsql_connect" {
  name   = "dsql_connect_${var.env}"
  role   = aws_iam_role.dsql_role.id
  policy = data.aws_iam_policy_document.dsql_connect.json
}
