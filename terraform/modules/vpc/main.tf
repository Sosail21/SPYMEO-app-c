# Cdw-Spm: Module VPC SPYMEO

# ══════════════════════════════════════════════════════════════════
# VPC
# ══════════════════════════════════════════════════════════════════

resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "spymeo-${var.environment}-vpc"
  }
}

# ══════════════════════════════════════════════════════════════════
# INTERNET GATEWAY
# ══════════════════════════════════════════════════════════════════

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "spymeo-${var.environment}-igw"
  }
}

# ══════════════════════════════════════════════════════════════════
# PUBLIC SUBNETS
# ══════════════════════════════════════════════════════════════════

resource "aws_subnet" "public" {
  count                   = length(var.public_subnets)
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_subnets[count.index]
  availability_zone       = var.availability_zones[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name = "spymeo-${var.environment}-public-${var.availability_zones[count.index]}"
    Type = "Public"
  }
}

# ══════════════════════════════════════════════════════════════════
# PRIVATE SUBNETS
# ══════════════════════════════════════════════════════════════════

resource "aws_subnet" "private" {
  count             = length(var.private_subnets)
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.private_subnets[count.index]
  availability_zone = var.availability_zones[count.index]

  tags = {
    Name = "spymeo-${var.environment}-private-${var.availability_zones[count.index]}"
    Type = "Private"
  }
}

# ══════════════════════════════════════════════════════════════════
# NAT GATEWAY
# ══════════════════════════════════════════════════════════════════

resource "aws_eip" "nat" {
  count  = var.enable_nat_gateway ? length(var.public_subnets) : 0
  domain = "vpc"

  tags = {
    Name = "spymeo-${var.environment}-nat-eip-${count.index + 1}"
  }

  depends_on = [aws_internet_gateway.main]
}

resource "aws_nat_gateway" "main" {
  count         = var.enable_nat_gateway ? length(var.public_subnets) : 0
  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = aws_subnet.public[count.index].id

  tags = {
    Name = "spymeo-${var.environment}-nat-${count.index + 1}"
  }

  depends_on = [aws_internet_gateway.main]
}

# ══════════════════════════════════════════════════════════════════
# ROUTE TABLES - PUBLIC
# ══════════════════════════════════════════════════════════════════

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name = "spymeo-${var.environment}-public-rt"
  }
}

resource "aws_route_table_association" "public" {
  count          = length(var.public_subnets)
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

# ══════════════════════════════════════════════════════════════════
# ROUTE TABLES - PRIVATE
# ══════════════════════════════════════════════════════════════════

resource "aws_route_table" "private" {
  count  = length(var.private_subnets)
  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = var.enable_nat_gateway ? aws_nat_gateway.main[count.index].id : null
  }

  tags = {
    Name = "spymeo-${var.environment}-private-rt-${count.index + 1}"
  }
}

resource "aws_route_table_association" "private" {
  count          = length(var.private_subnets)
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private[count.index].id
}

# ══════════════════════════════════════════════════════════════════
# VPC FLOW LOGS (pour monitoring)
# ══════════════════════════════════════════════════════════════════

resource "aws_cloudwatch_log_group" "vpc_flow_logs" {
  name              = "/aws/vpc/spymeo-${var.environment}"
  retention_in_days = 7

  tags = {
    Name = "spymeo-${var.environment}-vpc-flow-logs"
  }
}

resource "aws_iam_role" "vpc_flow_logs" {
  name = "spymeo-${var.environment}-vpc-flow-logs"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "vpc-flow-logs.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "vpc_flow_logs" {
  name = "spymeo-${var.environment}-vpc-flow-logs"
  role = aws_iam_role.vpc_flow_logs.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:DescribeLogGroups",
          "logs:DescribeLogStreams"
        ]
        Effect   = "Allow"
        Resource = "*"
      }
    ]
  })
}

resource "aws_flow_log" "main" {
  iam_role_arn    = aws_iam_role.vpc_flow_logs.arn
  log_destination = aws_cloudwatch_log_group.vpc_flow_logs.arn
  traffic_type    = "ALL"
  vpc_id          = aws_vpc.main.id

  tags = {
    Name = "spymeo-${var.environment}-vpc-flow-log"
  }
}
