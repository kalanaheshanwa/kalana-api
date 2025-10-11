module "route53" {
  source = "./modules/route53"

  domain_primary = var.route53_domain_root
}
