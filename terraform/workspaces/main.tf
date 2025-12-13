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
  s3_uploads_id                           = module.s3.uploads_id
  s3_uploads_bucket_regional_domain_name  = module.s3.uploads_bucket_regional_domain_name
}

module "dsql" {
  source = "./modules/dsql"

  env = var.env
}

module "lambda" {
  source = "./modules/lambda"

  project_namespace     = var.project_namespace
  env                   = var.env
  v_api                 = var.v_api
  dsql_cluster_arn      = module.dsql.cluster_arn
  dsql_connect_role_arn = module.dsql.role_arn
  s3_uploads_arn        = module.s3.uploads_arn

  NODE_ENV                       = var.NODE_ENV
  CORS_ALLOWED_ORIGINS           = var.CORS_ALLOWED_ORIGINS
  POSTGRES_DB                    = var.POSTGRES_DB
  POSTGRES_PORT                  = var.POSTGRES_PORT
  POSTGRES_HOST                  = var.POSTGRES_HOST
  APP_USER                       = var.APP_USER
  APP_AWS_DB_REGION              = var.APP_AWS_DB_REGION
  APP_AWS_REGION                 = var.APP_AWS_REGION
  APP_AWS_UPLOADS_S3_BUCKET_NAME = var.APP_AWS_UPLOADS_S3_BUCKET_NAME
}

module "api_gateway" {
  source = "./modules/gateway"

  project_namespace         = var.project_namespace
  env                       = var.env
  route53_zone_id           = data.aws_route53_zone.root.zone_id
  acm_certificate_api_arn   = module.acm.certificate_api_arn
  domain_api                = module.acm.domain_api
  lambda_main_invoke_arn    = module.lambda.lambda_main_invoke_arn
  lambda_main_function_name = module.lambda.lambda_main_function_name
}
