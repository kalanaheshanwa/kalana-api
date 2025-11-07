data "aws_iam_policy_document" "github_actions" {
  statement {
    effect = "Allow"
    actions = [
      "ecr:GetAuthorizationToken",
      "ecr:BatchCheckLayerAvailability",
      "ecr:GetDownloadUrlForLayer",
      "ecr:GetRepositoryPolicy",
      "ecr:DescribeRepositories",
      "ecr:ListImages",
      "ecr:DescribeImages",
      "ecr:BatchGetImage",
      "ecr:GetLifecyclePolicy",
      "ecr:GetLifecyclePolicyPreview",
      "ecr:ListTagsForResource",
      "ecr:DescribeImageScanFindings",
      "ecr:InitiateLayerUpload",
      "ecr:UploadLayerPart",
      "ecr:CompleteLayerUpload",
      "ecr:PutImage"
    ]
    resources = ["*"]
  }
}

resource "aws_iam_policy" "github_actions" {
  name   = "${var.project_namespace}_github_actions"
  policy = data.aws_iam_policy_document.github_actions.json
}

resource "aws_iam_user" "github_actions" {
  name = "${var.project_namespace}_github_actions"
}

resource "aws_iam_user_policy_attachment" "github_actions" {
  user       = aws_iam_user.github_actions.name
  policy_arn = aws_iam_policy.github_actions.arn
}

resource "aws_iam_access_key" "github_actions" {
  user = aws_iam_user.github_actions.name
}
