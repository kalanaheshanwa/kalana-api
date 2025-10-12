locals {
  env     = coalesce(var.env, terraform.workspace)
  is_prod = local.env == "prod"

  # Frontend hostnames by env
  primary_domain = local.is_prod ? var.domain_apex : "${local.env}.${var.domain_apex}"
  frontend_alt_names = distinct(compact([
    local.is_prod ? "www.${var.domain_apex}" : null,
  ]))
  frontend_aliases = distinct(concat([local.primary_domain], local.frontend_alt_names))

  # API domain by env
  api_domain = local.is_prod ? "${var.subdomain_api}.${var.domain_apex}" : "${var.subdomain_api}.${local.env}.${var.domain_apex}"
}

# =====================================
# ACM for CloudFront (us-east-1)
# =====================================
resource "aws_acm_certificate" "frontend" {
  provider                  = aws.use1
  domain_name               = local.primary_domain
  subject_alternative_names = local.frontend_alt_names
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "frontend_cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.frontend.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      type   = dvo.resource_record_type
      record = dvo.resource_record_value
    }
  }

  allow_overwrite = true
  zone_id         = var.route53_zone_id
  name            = each.value.name
  type            = each.value.type
  ttl             = 60
  records         = [each.value.record]

}

resource "aws_acm_certificate_validation" "frontend" {
  provider                = aws.use1
  certificate_arn         = aws_acm_certificate.frontend.arn
  validation_record_fqdns = [for record in aws_route53_record.frontend_cert_validation : record.fqdn]
}

# =====================================
# ACM for API Gateway v2 (Regional, same region as API)
# =====================================
# resource "aws_acm_certificate" "api" {
#   domain_name       = local.api_domain
#   validation_method = "DNS"

#   lifecycle { create_before_destroy = true }
# }

# resource "aws_route53_record" "api_cert_validation" {
#   for_each = {
#     for dvo in aws_acm_certificate.api.domain_validation_options : dvo.domain_name => {
#       name   = dvo.resource_record_name
#       type   = dvo.resource_record_type
#       record = dvo.resource_record_value
#     }
#   }

#   allow_overwrite = true
#   zone_id         = var.route53_zone_id
#   name            = each.value.name
#   type            = each.value.type
#   ttl             = 60
#   records         = [each.value.record]
# }

# resource "aws_acm_certificate_validation" "api" {
#   certificate_arn         = aws_acm_certificate.api.arn
#   validation_record_fqdns = [for record in aws_route53_record.api_cert_validation : record.fqdn]
# }
