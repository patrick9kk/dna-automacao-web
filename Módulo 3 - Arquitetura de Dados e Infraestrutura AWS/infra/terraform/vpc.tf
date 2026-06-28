# ── VPC Principal ──────────────────────────────────────────────────────────
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_support   = true
  enable_dns_hostnames = true
  tags = { Name = "${var.project_name}-vpc-${var.environment}" }
}

# ── Subnets Privadas (RDS, Lambda, Glue) ──────────────────────────────────
resource "aws_subnet" "private" {
  count             = length(var.availability_zones)
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 4, count.index)
  availability_zone = var.availability_zones[count.index]
  tags = { Name = "${var.project_name}-private-${var.availability_zones[count.index]}-${var.environment}" }
}

# ── Subnets Públicas (NAT Gateway, ALB) ───────────────────────────────────
resource "aws_subnet" "public" {
  count                   = length(var.availability_zones)
  vpc_id                  = aws_vpc.main.id
  cidr_block              = cidrsubnet(var.vpc_cidr, 4, count.index + 10)
  availability_zone       = var.availability_zones[count.index]
  map_public_ip_on_launch = false
  tags = { Name = "${var.project_name}-public-${var.availability_zones[count.index]}-${var.environment}" }
}

# ── Internet Gateway ───────────────────────────────────────────────────────
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
  tags   = { Name = "${var.project_name}-igw-${var.environment}" }
}

# ── Elastic IP + NAT Gateway (AZ primária) ────────────────────────────────
resource "aws_eip" "nat" {
  domain = "vpc"
  tags   = { Name = "${var.project_name}-nat-eip-${var.environment}" }
}

resource "aws_nat_gateway" "main" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.public[0].id
  tags          = { Name = "${var.project_name}-nat-${var.environment}" }
  depends_on    = [aws_internet_gateway.main]
}

# ── Route Tables ───────────────────────────────────────────────────────────
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  route { cidr_block = "0.0.0.0/0"; gateway_id = aws_internet_gateway.main.id }
  tags = { Name = "${var.project_name}-rt-public-${var.environment}" }
}

resource "aws_route_table" "private" {
  vpc_id = aws_vpc.main.id
  route { cidr_block = "0.0.0.0/0"; nat_gateway_id = aws_nat_gateway.main.id }
  tags = { Name = "${var.project_name}-rt-private-${var.environment}" }
}

resource "aws_route_table_association" "public" {
  count          = length(var.availability_zones)
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "private" {
  count          = length(var.availability_zones)
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private.id
}

# ── VPC Endpoints (tráfego S3/DynamoDB sem sair da VPC) ───────────────────
resource "aws_vpc_endpoint" "s3" {
  vpc_id            = aws_vpc.main.id
  service_name      = "com.amazonaws.${var.aws_region}.s3"
  vpc_endpoint_type = "Gateway"
  route_table_ids   = [aws_route_table.private.id]
  tags = { Name = "${var.project_name}-vpce-s3-${var.environment}" }
}

resource "aws_vpc_endpoint" "secretsmanager" {
  vpc_id              = aws_vpc.main.id
  service_name        = "com.amazonaws.${var.aws_region}.secretsmanager"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = aws_subnet.private[*].id
  security_group_ids  = [aws_security_group.vpc_endpoints.id]
  private_dns_enabled = true
  tags = { Name = "${var.project_name}-vpce-secrets-${var.environment}" }
}

# ── Security Groups ────────────────────────────────────────────────────────
resource "aws_security_group" "rds" {
  name        = "${var.project_name}-rds-sg-${var.environment}"
  description = "Acesso ao RDS apenas de recursos internos da VPC"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "PostgreSQL da VPC"
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
  }
  egress { from_port = 0; to_port = 0; protocol = "-1"; cidr_blocks = ["0.0.0.0/0"] }
  tags = { Name = "${var.project_name}-rds-sg-${var.environment}" }
}

resource "aws_security_group" "glue" {
  name        = "${var.project_name}-glue-sg-${var.environment}"
  description = "Glue ETL jobs — acesso ao RDS e S3"
  vpc_id      = aws_vpc.main.id

  ingress { from_port = 0; to_port = 65535; protocol = "tcp"; self = true }
  egress  { from_port = 0; to_port = 0;     protocol = "-1"; cidr_blocks = ["0.0.0.0/0"] }
  tags = { Name = "${var.project_name}-glue-sg-${var.environment}" }
}

resource "aws_security_group" "vpc_endpoints" {
  name        = "${var.project_name}-vpce-sg-${var.environment}"
  description = "VPC Interface Endpoints"
  vpc_id      = aws_vpc.main.id

  ingress { from_port = 443; to_port = 443; protocol = "tcp"; cidr_blocks = [var.vpc_cidr] }
  egress  { from_port = 0;   to_port = 0;   protocol = "-1"; cidr_blocks = ["0.0.0.0/0"] }
  tags = { Name = "${var.project_name}-vpce-sg-${var.environment}" }
}

# ── DB Subnet Group ────────────────────────────────────────────────────────
resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-db-subnet-group-${var.environment}"
  subnet_ids = aws_subnet.private[*].id
  tags       = { Name = "${var.project_name}-db-subnet-group-${var.environment}" }
}

output "vpc_id"              { value = aws_vpc.main.id }
output "private_subnet_ids"  { value = aws_subnet.private[*].id }
output "public_subnet_ids"   { value = aws_subnet.public[*].id }
output "db_subnet_group_name"{ value = aws_db_subnet_group.main.name }
