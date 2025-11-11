data "aws_ecr_repository" "api" {
  name = "${var.project_namespace}/api"
}

data "aws_iam_policy_document" "lambda_assume_role" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

data "aws_iam_policy_document" "lambda_permissions" {
  statement {
    effect = "Allow"
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents",
    ]
    resources = ["arn:aws:logs:*:*:*"]
  }
}

resource "aws_iam_policy" "lambda_permissions" {
  name   = "${var.project_namespace}_api_lambda_permissions_${var.env}"
  policy = data.aws_iam_policy_document.lambda_permissions.json
}

data "aws_iam_policy_document" "lambda_dsql_connect" {
  statement {
    effect    = "Allow"
    actions   = ["dsql:DbConnect"]
    resources = [var.dsql_cluster_arn]
  }
}

resource "aws_iam_policy" "lambda_dsql_connect" {
  name   = "${var.project_namespace}_api_lambda_dsql_${var.env}"
  policy = data.aws_iam_policy_document.lambda_dsql_connect.json
}

resource "aws_iam_role" "lambda_handler" {
  name               = "${var.project_namespace}_api_lambda_handler_${var.env}"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role.json
}

resource "aws_iam_role_policy_attachment" "lambda_execution" {
  role       = aws_iam_role.lambda_handler.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy_attachment" "lambda_permissions" {
  role       = aws_iam_role.lambda_handler.name
  policy_arn = aws_iam_policy.lambda_permissions.arn
}

resource "aws_iam_role_policy_attachment" "lambda_dsql_connect" {
  role       = aws_iam_role.lambda_handler.name
  policy_arn = aws_iam_policy.lambda_dsql_connect.arn
}

resource "aws_lambda_function" "handler" {
  function_name = "${var.project_namespace}_handler_${var.env}"
  role          = aws_iam_role.lambda_handler.arn
  package_type  = "Image"
  architectures = ["x86_64"]

  timeout     = 7
  memory_size = 512

  image_uri = "${data.aws_ecr_repository.api.repository_url}:${var.v_api}"

  environment {
    variables = {
      "NODE_ENV"             = var.NODE_ENV
      "PORT"                 = "3000" # fake port (unused)
      "CORS_ALLOWED_ORIGINS" = var.CORS_ALLOWED_ORIGINS
      "POSTGRES_DB"          = var.POSTGRES_DB
      "POSTGRES_PORT"        = var.POSTGRES_PORT
      "POSTGRES_HOST"        = var.POSTGRES_HOST
      "APP_USER"             = var.APP_USER
      "APP_AWS_DB_REGION"    = var.APP_AWS_DB_REGION
    }
  }
}
