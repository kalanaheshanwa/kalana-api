data "aws_iam_policy_document" "lambda_image_pull" {
  statement {
    effect = "Allow"

    actions = [
      "ecr:GetDownloadUrlForLayer",
      "ecr:BatchGetImage",
    ]

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_ecr_repository" "api" {
  name                 = "${var.project_namespace}/api"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = false
  }
}

resource "aws_ecr_repository_policy" "api" {
  repository = aws_ecr_repository.api.name
  policy     = data.aws_iam_policy_document.lambda_image_pull.json
}
