# ── Cognito User Pool ───────────────────────────────────────────────────────
resource "aws_cognito_user_pool" "main" {
  name = "${var.project_name}-user-pool-${var.environment}"

  # Política de senhas
  password_policy {
    minimum_length                   = 12
    require_uppercase                = true
    require_lowercase                = true
    require_numbers                  = true
    require_symbols                  = true
    temporary_password_validity_days = 1
  }

  # MFA obrigatório para produção
  mfa_configuration = var.environment == "prod" ? "ON" : "OPTIONAL"
  software_token_mfa_configuration { enabled = true }

  # Atributos customizados para ABAC
  schema {
    name                = "department"
    attribute_data_type = "String"
    mutable             = true
    string_attribute_constraints { min_length = "1"; max_length = "100" }
  }
  schema {
    name                = "plant"
    attribute_data_type = "String"
    mutable             = true
    string_attribute_constraints { min_length = "1"; max_length = "100" }
  }
  schema {
    name                = "role"
    attribute_data_type = "String"
    mutable             = true
    string_attribute_constraints { min_length = "1"; max_length = "50" }
  }

  # Verificação de e-mail
  auto_verified_attributes = ["email"]

  # Proteção avançada
  user_pool_add_ons { advanced_security_mode = "ENFORCED" }

  # Expiração de tokens
  token_validity_units {
    access_token  = "hours"
    id_token      = "hours"
    refresh_token = "days"
  }

  admin_create_user_config { allow_admin_create_user_only = true }

  tags = { Name = "${var.project_name}-user-pool-${var.environment}" }
}

# ── Identity Provider SAML (SSO corporativo) ───────────────────────────────
resource "aws_cognito_identity_provider" "saml_idp" {
  user_pool_id  = aws_cognito_user_pool.main.id
  provider_name = "CorporateSSO"
  provider_type = "SAML"

  provider_details = {
    MetadataURL             = var.saml_metadata_url
    SSORedirectBindingURI   = var.saml_metadata_url
    IDPSignout              = "true"
  }

  # Mapeamento de atributos SAML → Cognito
  attribute_mapping = {
    email                     = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
    name                      = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
    "custom:department"       = "department"
    "custom:plant"            = "plant"
    "custom:role"             = "role"
  }
}

# ── Cognito Domain ─────────────────────────────────────────────────────────
resource "aws_cognito_user_pool_domain" "main" {
  domain       = "${var.cognito_domain_prefix}-${var.environment}"
  user_pool_id = aws_cognito_user_pool.main.id
}

# ── App Client (SPA frontend) ──────────────────────────────────────────────
resource "aws_cognito_user_pool_client" "frontend" {
  name         = "${var.project_name}-frontend-${var.environment}"
  user_pool_id = aws_cognito_user_pool.main.id

  generate_secret                      = false
  prevent_user_existence_errors        = "ENABLED"
  enable_token_revocation              = true
  enable_propagate_additional_user_context_data = false

  allowed_oauth_flows                  = ["code"]
  allowed_oauth_scopes                 = ["openid", "email", "profile"]
  allowed_oauth_flows_user_pool_client = true
  supported_identity_providers         = ["CorporateSSO"]

  callback_urls = [
    "https://${var.project_name}-${var.environment}.dnafacilities.com.br/callback"
  ]
  logout_urls = [
    "https://${var.project_name}-${var.environment}.dnafacilities.com.br/logout"
  ]

  token_validity_units {
    access_token  = "hours"
    id_token      = "hours"
    refresh_token = "days"
  }
  access_token_validity  = 1
  id_token_validity      = 1
  refresh_token_validity = 1
}

# ── App Client (M2M / API) ─────────────────────────────────────────────────
resource "aws_cognito_user_pool_client" "api_client" {
  name         = "${var.project_name}-api-m2m-${var.environment}"
  user_pool_id = aws_cognito_user_pool.main.id

  generate_secret               = true
  prevent_user_existence_errors = "ENABLED"
  enable_token_revocation       = true

  allowed_oauth_flows                  = ["client_credentials"]
  allowed_oauth_scopes                 = ["dna-automacao/read", "dna-automacao/extract"]
  allowed_oauth_flows_user_pool_client = true
  supported_identity_providers         = ["COGNITO"]

  access_token_validity = 1
  token_validity_units  { access_token = "hours" }
}

# ── Grupos RBAC ────────────────────────────────────────────────────────────
resource "aws_cognito_user_group" "admin" {
  name         = "Administrador"
  user_pool_id = aws_cognito_user_pool.main.id
  description  = "Gestão total, configuração de alertas e auditoria"
  precedence   = 1
  role_arn     = aws_iam_role.cognito_admin_role.arn
}

resource "aws_cognito_user_group" "analyst" {
  name         = "Analista"
  user_pool_id = aws_cognito_user_pool.main.id
  description  = "Visualização de dashboards, filtros e extração de dados operacionais"
  precedence   = 2
  role_arn     = aws_iam_role.cognito_analyst_role.arn
}

resource "aws_cognito_user_group" "auditor" {
  name         = "Auditor"
  user_pool_id = aws_cognito_user_pool.main.id
  description  = "Acesso exclusivamente em modo de leitura aos logs do sistema"
  precedence   = 3
  role_arn     = aws_iam_role.cognito_auditor_role.arn
}

output "cognito_user_pool_id"     { value = aws_cognito_user_pool.main.id }
output "cognito_user_pool_arn"    { value = aws_cognito_user_pool.main.arn }
output "cognito_frontend_client"  { value = aws_cognito_user_pool_client.frontend.id }
output "cognito_issuer_url"       { value = "https://cognito-idp.${var.aws_region}.amazonaws.com/${aws_cognito_user_pool.main.id}" }
