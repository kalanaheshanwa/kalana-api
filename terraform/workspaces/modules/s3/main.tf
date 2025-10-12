data "aws_iam_role" "gha_assume_role" {
  name = "${var.project_namespace}_gha_deploy"
}

resource "aws_s3_bucket" "frontend" {
  bucket = "${var.project_namespace}-frontend-${var.env}"
}

resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

data "aws_iam_policy_document" "frontend" {
  statement {
    actions = ["s3:GetObject"]

    resources = ["${aws_s3_bucket.frontend.arn}/*"]

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [var.cloudfront_frontend_arn]
    }
  }

  statement {
    sid = "AllowDeployRoleWrite"
    effect = "Allow"

    principals {
      type        = "AWS"
      identifiers = [data.aws_iam_role.gha_assume_role.arn]
    }

    actions = [
      "s3:PutObject",
      "s3:DeleteObject",
      "s3:GetObject"
    ]

    resources = ["${aws_s3_bucket.frontend.arn}/*"]
  }
}

resource "aws_s3_bucket_policy" "frontend" {
  bucket = aws_s3_bucket.frontend.id
  policy = data.aws_iam_policy_document.frontend.json
}
