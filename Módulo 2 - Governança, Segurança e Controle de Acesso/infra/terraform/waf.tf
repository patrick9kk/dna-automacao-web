resource "aws_wafv2_web_acl" "main" {
  name        = "${var.project_name}-waf-${var.environment}"
  description = "WAF DNA Automação — proteção contra SQLi, XSS, DDoS e bots"
  scope       = "REGIONAL"

  default_action { allow {} }

  # Regra 1: Rate limiting por IP
  rule {
    name     = "RateLimitPerIP"
    priority = 1
    action { block {} }
    statement {
      rate_based_statement {
        limit              = var.waf_rate_limit
        aggregate_key_type = "IP"
      }
    }
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "RateLimitPerIP"
      sampled_requests_enabled   = true
    }
  }

  # Regra 2: AWS Managed Rules — Common (SQLi, XSS, LFI)
  rule {
    name     = "AWSManagedRulesCommonRuleSet"
    priority = 2
    override_action { none {} }
    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesCommonRuleSet"
        vendor_name = "AWS"
      }
    }
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "AWSCommonRules"
      sampled_requests_enabled   = true
    }
  }

  # Regra 3: AWS Managed Rules — Known Bad Inputs
  rule {
    name     = "AWSManagedRulesKnownBadInputsRuleSet"
    priority = 3
    override_action { none {} }
    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesKnownBadInputsRuleSet"
        vendor_name = "AWS"
      }
    }
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "AWSKnownBadInputs"
      sampled_requests_enabled   = true
    }
  }

  # Regra 4: SQL Injection explícito
  rule {
    name     = "BlockSQLInjection"
    priority = 4
    action { block {} }
    statement {
      sqli_match_statement {
        field_to_match { body { oversize_handling = "CONTINUE" } }
        text_transformations { priority = 1; type = "URL_DECODE" }
        text_transformations { priority = 2; type = "HTML_ENTITY_DECODE" }
      }
    }
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "BlockSQLInjection"
      sampled_requests_enabled   = true
    }
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "${var.project_name}-waf-${var.environment}"
    sampled_requests_enabled   = true
  }
}

output "waf_acl_arn" { value = aws_wafv2_web_acl.main.arn }
