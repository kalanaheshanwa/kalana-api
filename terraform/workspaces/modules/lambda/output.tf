output "lambda_main_invoke_arn" {
  value = aws_lambda_function.handler.invoke_arn
}

output "lambda_main_function_name" {
  value = aws_lambda_function.handler.function_name
}
