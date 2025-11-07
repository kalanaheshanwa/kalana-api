module "route53" {
  source = "./modules/route53"

  domain_primary = var.route53_domain_root
}

module "oidc" {
  source = "./modules/oidc"

  project_namespace = var.project_namespace
  github_owner      = var.github_owner
  github_repo       = var.github_repo
}

module "dsql" {
  source = "./modules/dsql"
}

module "ecr" {
  source = "./modules/ecr"

  project_namespace = var.project_namespace
}

module "iam" {
  source = "./modules/iam"

  project_namespace = var.project_namespace
}
