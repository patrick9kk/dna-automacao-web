# ── Origin Access Control (OAC) — CloudFront → S3 ─────────────────────────
resource "aws_cloudfront_origin_access_control" "frontend" {
  name                              = "${var.project_name}-oac-${var.environment}"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# ── Cache Policies ─────────────────────────────────────────────────────────
resource "aws_cloudfront_cache_policy" "assets" {
  name        = "${var.project_name}-assets-cache-${var.environment}"
  comment     = "Cache longo para assets com hash no nome (JS, CSS, imagens)"
  min_ttl     = 0
  default_ttl = 86400      # 1 dia
  max_ttl     = 31536000   # 1 ano

  parameters_in_cache_key_and_forwarded_to_origin {
    cookies_config  { cookie_behavior = "none" }
    headers_config  { header_behavior = "none" }
    query_strings_config { query_string_behavior = "none" }
    enable_accept_encoding_gzip   = true
    enable_accept_encoding_brotli = true
  }
}

resource "aws_cloudfront_cache_policy" "spa" {
  name        = "${var.project_name}-spa-cache-${var.environment}"
  comment     = "Cache curto para index.html (SPA entry point)"
  min_ttl     = 0
  default_ttl = 60     # 1 minuto
  max_ttl     = 300    # 5 minutos

  parameters_in_cache_key_and_forwarded_to_origin {
    cookies_config  { cookie_behavior = "none" }
    headers_config  { header_behavior = "none" }
    query_strings_config { query_string_behavior = "none" }
    enable_accept_encoding_gzip   = true
    enable_accept_encoding_brotli = true
  }
}

# ── CloudFront Distribution ────────────────────────────────────────────────
resource "aws_cloudfront_distribution" "frontend" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  aliases             = [var.domain_name]
  price_class         = "PriceClass_100"   # US + Europa (menor custo)
  web_acl_id          = var.waf_acl_arn != "" ? var.waf_acl_arn : null
  comment             = "DNA Automação Frontend — ${var.environment}"

  # Origem S3
  origin {
    domain_name              = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_id                = "S3-${aws_s3_bucket.frontend.bucket}"
    origin_access_control_id = aws_cloudfront_origin_access_control.frontend.id
  }

  # Origem API Gateway (proxy reverso — sem CORS no frontend)
  origin {
    domain_name = replace(replace(var.api_gateway_url, "https://", ""), "/*/", "")
    origin_id   = "APIGateway"
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  # Comportamento padrão: SPA assets do S3
  default_cache_behavior {
    target_origin_id       = "S3-${aws_s3_bucket.frontend.bucket}"
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    cache_policy_id        = aws_cloudfront_cache_policy.spa.id
    viewer_protocol_policy = "redirect-to-https"
    compress               = true
  }

  # /assets/* — JS, CSS, imagens com cache longo
  ordered_cache_behavior {
    path_pattern           = "/assets/*"
    target_origin_id       = "S3-${aws_s3_bucket.frontend.bucket}"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    cache_policy_id        = aws_cloudfront_cache_policy.assets.id
    viewer_protocol_policy = "redirect-to-https"
    compress               = true
  }

  # /api/* — proxy para API Gateway
  ordered_cache_behavior {
    path_pattern             = "/api/*"
    target_origin_id         = "APIGateway"
    allowed_methods          = ["DELETE","GET","HEAD","OPTIONS","PATCH","POST","PUT"]
    cached_methods           = ["GET","HEAD"]
    viewer_protocol_policy   = "https-only"
    cache_policy_id          = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"  # CachingDisabled
    origin_request_policy_id = "b689b0a8-53d0-40ab-baf2-68738e2966ac"  # AllViewerExceptHostHeader
    compress                 = false
  }

  # SPA fallback: redireciona 404 para index.html (React Router)
  custom_error_response {
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 0
  }
  custom_error_response {
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 0
  }

  restrictions {
    geo_restriction { restriction_type = "none" }
  }

  viewer_certificate {
    acm_certificate_arn      = var.acm_certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  tags = { Name = "${var.project_name}-cf-${var.environment}" }
}

output "cloudfront_domain"          { value = aws_cloudfront_distribution.frontend.domain_name }
output "cloudfront_distribution_id" { value = aws_cloudfront_distribution.frontend.id }
