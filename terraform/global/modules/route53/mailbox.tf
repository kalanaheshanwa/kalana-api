# SPF
resource "aws_route53_record" "sender_spf" {
  zone_id = aws_route53_zone.primary.zone_id
  name    = var.domain_primary
  type    = "TXT"
  ttl     = 3600
  records = ["zoho-verification=zb64245025.zmverify.zoho.com", "v=spf1 include:zohomail.com ~all"]
}

# DKIM
resource "aws_route53_record" "sender_dkim" {
  zone_id = aws_route53_zone.primary.zone_id
  name    = "zmail._domainkey.${var.domain_primary}"
  type    = "TXT"
  ttl     = 3600
  records = ["v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCFQdRYVNG13AHJJs9IJ7XdhHNWsfi62j1RiQvz2reQp7WevgUvNfO0Tjx2LKfbaI9ZChB08y4zeFqqNmeJsyNrhaX7p1UAeSPGymyZeyYecYOxHJ/27p4uJAAwXDdyalJdJNBLb37/1JhXIkMzmA2wNlmP8J0pA05yli56MeLfuwIDAQAB"]
}

resource "aws_route53_record" "sender_mx" {
  zone_id = aws_route53_zone.primary.zone_id
  name    = var.domain_primary
  type    = "MX"
  ttl     = 3600
  records = ["10 mx.zoho.com", "20 mx2.zoho.com", "50 mx3.zoho.com"]
}
