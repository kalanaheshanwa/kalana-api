output "certificate_frontend_arn" {
  value       = aws_acm_certificate.frontend.arn
  description = "ARN of the frontend certificate"
}

output "domain_frontend_aliases" {
  value       = local.frontend_aliases
  description = "ARN of the frontend certificate"
}

output "domain_primary" {
  value       = local.primary_domain
  description = "Primary domain of the env"
}

output "domain_api" {
  value       = local.api_domain
  description = "Domain name of the api"
}

output "certificate_api_arn" {
  value       = aws_acm_certificate.api.arn
  description = "ARN of the api certificate"
}
