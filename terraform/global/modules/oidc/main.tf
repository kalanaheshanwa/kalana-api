data "aws_s3_bucket" "frontend_dev" {
  bucket = "${var.project_namespace}-frontend-dev"
}

# OIDC provider for GitHub Actions
resource "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"

  client_id_list = [
    "sts.amazonaws.com"
  ]
}

data "aws_iam_policy_document" "gha_assume_role" {
  statement {
    sid     = "AllowOIDCToAssumeRole"
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [aws_iam_openid_connect_provider.github.arn]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }

    # Allow any ref (branches/tags/PRs) for THIS repo only
    condition {
      test     = "StringLike"
      variable = "token.actions.githubusercontent.com:sub"
      values   = ["repo:${var.github_owner}/${var.github_repo}:*"]
    }
  }
}

resource "aws_iam_role" "gha_deploy_role" {
  name               = "${var.project_namespace}_gha_deploy"
  assume_role_policy = data.aws_iam_policy_document.gha_assume_role.json
}

# S3 deploy policy (minimal but practical for static site deploys)
data "aws_iam_policy_document" "s3_deploy" {
  statement {
    effect = "Allow"
    actions = [
      "s3:ListBucket",
      "s3:GetBucketLocation",
      "s3:PutObject",
      "s3:PutObjectAcl",
      "s3:GetObject",
      "s3:DeleteObject",
      "s3:AbortMultipartUpload",
      "s3:ListBucketMultipartUploads"
    ]
    resources = [data.aws_s3_bucket.frontend_dev.arn]
  }
}

resource "aws_iam_policy" "s3_deploy" {
  name   = "${var.project_namespace}_s3_deploy"
  policy = data.aws_iam_policy_document.s3_deploy.json
}

resource "aws_iam_role_policy_attachment" "attach_s3_deploy" {
  role       = aws_iam_role.gha_deploy_role.name
  policy_arn = aws_iam_policy.s3_deploy.arn
}

# (Optional) If you invalidate CloudFront after deploy, attach this too:
# data "aws_iam_policy_document" "cloudfront_invalidate" {
#   statement {
#     effect = "Allow"
#     actions = ["cloudfront:CreateInvalidation", "cloudfront:GetInvalidation", "cloudfront:ListDistributions"]
#     resources = ["*"]
#   }
# }
# resource "aws_iam_policy" "cloudfront_invalidate" {
#   name   = "${var.project_name}-cloudfront-invalidate"
#   policy = data.aws_iam_policy_document.cloudfront_invalidate.json
# }
# resource "aws_iam_role_policy_attachment" "attach_cloudfront" {
#   role       = aws_iam_role.gha_deploy_role.name
#   policy_arn = aws_iam_policy.cloudfront_invalidate.arn
# }
