data "aws_route53_zone" "root" {
  name         = var.domain_apex
  private_zone = false
}

module "acm" {
  source = "./modules/acm"

  providers = {
    aws.use1 = aws.use1
  }

  project_namespace = var.project_namespace
  env               = var.env
  route53_zone_id   = data.aws_route53_zone.root.zone_id
  domain_apex       = var.domain_apex
  subdomain_api     = var.subdomain_api
}

module "s3" {
  source = "./modules/s3"

  project_namespace       = var.project_namespace
  env                     = var.env
  cloudfront_frontend_arn = module.cloudfront.frontend_arn
}

module "cloudfront" {
  source = "./modules/cloud-front"

  project_namespace                       = var.project_namespace
  env                                     = var.env
  s3_frontend_id                          = module.s3.frontend_id
  s3_frontend_bucket_regional_domain_name = module.s3.frontend_bucket_regional_domain_name
  acm_certificate_frontend_arn            = module.acm.certificate_frontend_arn
  domain_frontend_aliases                 = module.acm.domain_frontend_aliases
  route53_zone_id                         = data.aws_route53_zone.root.zone_id
}

module "dsql" {
  source = "./modules/dsql"

  env = var.env
}
