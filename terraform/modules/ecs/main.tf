# Cdw-Spm: Module ECS Fargate SPYMEO

# ══════════════════════════════════════════════════════════════════
# ECS CLUSTER
# ══════════════════════════════════════════════════════════════════

resource "aws_ecs_cluster" "main" {
  name = "spymeo-${var.environment}"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Name = "spymeo-${var.environment}-cluster"
  }
}

# ══════════════════════════════════════════════════════════════════
# SECURITY GROUPS
# ══════════════════════════════════════════════════════════════════

resource "aws_security_group" "alb" {
  name        = "spymeo-${var.environment}-alb-sg"
  description = "Security group for ALB"
  vpc_id      = var.vpc_id

  ingress {
    description = "HTTP from anywhere"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS from anywhere"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "Allow all outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "spymeo-${var.environment}-alb-sg"
  }
}

resource "aws_security_group" "app" {
  name        = "spymeo-${var.environment}-app-sg"
  description = "Security group for ECS tasks"
  vpc_id      = var.vpc_id

  ingress {
    description     = "App port from ALB"
    from_port       = var.app_port
    to_port         = var.app_port
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    description = "Allow all outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "spymeo-${var.environment}-app-sg"
  }
}

# ══════════════════════════════════════════════════════════════════
# ALB (Application Load Balancer)
# ══════════════════════════════════════════════════════════════════

resource "aws_lb" "main" {
  name               = "spymeo-${var.environment}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = var.public_subnets

  enable_deletion_protection = var.environment == "production"
  enable_http2              = true
  enable_cross_zone_load_balancing = true

  tags = {
    Name = "spymeo-${var.environment}-alb"
  }
}

resource "aws_lb_target_group" "app" {
  name        = "spymeo-${var.environment}-tg"
  port        = var.app_port
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = var.health_check_interval
    path                = var.health_check_path
    matcher             = "200"
  }

  deregistration_delay = 30

  tags = {
    Name = "spymeo-${var.environment}-tg"
  }
}

# HTTP listener
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app.arn
  }
}

# HTTPS listener
#resource "aws_lb_listener" "https" {
#  load_balancer_arn = aws_lb.main.arn
#  port              = 443
#  protocol          = "HTTPS"
#  ssl_policy        = "ELBSecurityPolicy-TLS-1-2-2017-01"
#  certificate_arn   = var.certificate_arn

#  default_action {
 #   type             = "forward"
 #   target_group_arn = aws_lb_target_group.app.arn
#  }
#}


# ══════════════════════════════════════════════════════════════════
# IAM ROLES
# ══════════════════════════════════════════════════════════════════

# Task execution role
resource "aws_iam_role" "ecs_task_execution" {
  name = "spymeo-${var.environment}-ecs-task-execution"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution" {
  role       = aws_iam_role.ecs_task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# Additional policy for secrets
resource "aws_iam_role_policy" "ecs_task_execution_secrets" {
  name = "secrets-access"
  role = aws_iam_role.ecs_task_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "secretsmanager:GetSecretValue",
          "kms:Decrypt"
        ]
        Effect   = "Allow"
        Resource = "*"
      }
    ]
  })
}

# Task role
resource "aws_iam_role" "ecs_task" {
  name = "spymeo-${var.environment}-ecs-task"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
}

# S3 access for the app
resource "aws_iam_role_policy" "ecs_task_s3" {
  name = "s3-access"
  role = aws_iam_role.ecs_task.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Effect   = "Allow"
        Resource = "*"
      }
    ]
  })
}

# ══════════════════════════════════════════════════════════════════
# CLOUDWATCH LOG GROUP
# ══════════════════════════════════════════════════════════════════

#resource "aws_cloudwatch_log_group" "app" {
#  name              = "/ecs/spymeo-${var.environment}"
#  retention_in_days = var.environment == "production" ? 365 : 30

#  tags = {
#    Name = "spymeo-${var.environment}-logs"
#  }
#}

# ══════════════════════════════════════════════════════════════════
# ECS TASK DEFINITION
# ══════════════════════════════════════════════════════════════════

resource "aws_ecs_task_definition" "app" {
  family                   = "spymeo-${var.environment}-app"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.task_cpu
  memory                   = var.task_memory
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([
    {
      name      = var.app_name
      image     = var.container_image
      essential = true

      portMappings = [
        {
          containerPort = var.app_port
          protocol      = "tcp"
        }
      ]

      environment = var.environment_variables

      secrets = var.secrets

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/spymeo-production"
          "awslogs-region"        = data.aws_region.current.name
          "awslogs-stream-prefix" = "ecs"
        }
      }

      healthCheck = {
        command     = ["CMD-SHELL", "curl -f http://localhost:${var.app_port}${var.health_check_path} || exit 1"]
        interval    = 30
        timeout     = 5
        retries     = 3
        startPeriod = 60
      }
    }
  ])

  tags = {
    Name = "spymeo-${var.environment}-task"
  }
}

# ══════════════════════════════════════════════════════════════════
# ECS SERVICE
# ══════════════════════════════════════════════════════════════════

resource "aws_ecs_service" "app" {
  name            = "spymeo-${var.environment}-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.app.arn
  desired_count   = var.desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.private_subnets
    security_groups  = [aws_security_group.app.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.app.arn
    container_name   = var.app_name
    container_port   = var.app_port
  }

  health_check_grace_period_seconds = 60

    deployment_maximum_percent         = 200
    deployment_minimum_healthy_percent = 100

  enable_execute_command = true

  tags = {
    Name = "spymeo-${var.environment}-service"
  }

  depends_on = [
    aws_iam_role_policy_attachment.ecs_task_execution
  ]
}

# ══════════════════════════════════════════════════════════════════
# AUTO SCALING
# ══════════════════════════════════════════════════════════════════

resource "aws_appautoscaling_target" "ecs" {
  max_capacity       = var.desired_count * 3
  min_capacity       = var.desired_count
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.app.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "cpu" {
  name               = "spymeo-${var.environment}-cpu-autoscaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.ecs.resource_id
  scalable_dimension = aws_appautoscaling_target.ecs.scalable_dimension
  service_namespace  = aws_appautoscaling_target.ecs.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value = 70.0
  }
}

resource "aws_appautoscaling_policy" "memory" {
  name               = "spymeo-${var.environment}-memory-autoscaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.ecs.resource_id
  scalable_dimension = aws_appautoscaling_target.ecs.scalable_dimension
  service_namespace  = aws_appautoscaling_target.ecs.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageMemoryUtilization"
    }
    target_value = 70.0
  }
}

# ══════════════════════════════════════════════════════════════════
# DATA SOURCES
# ══════════════════════════════════════════════════════════════════

data "aws_region" "current" {}
