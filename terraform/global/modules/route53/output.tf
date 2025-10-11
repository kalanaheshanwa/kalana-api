output "route53_zone_id" {
  value = aws_route53_zone.primary.zone_id
}

output "route53_name_servers" {
  description = "Set these at domain registrar's nameservers"
  value       = aws_route53_zone.primary.name_servers
}
