variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "project_name" {
  type    = string
  default = "customer-support-agent"
}

# GitHub OIDC
variable "github_org" {
  description = "GitHub organisation or user that owns the repository"
  type        = string
}

variable "github_repo" {
  description = "GitHub repository name (without the org prefix)"
  type        = string
}

# Pre-existing resources — passed in, not created
variable "ecs_cluster_name" {
  description = "Name of the existing ECS cluster"
  type        = string
}

variable "ecr_repository_name" {
  description = "Name of the existing ECR repository"
  type        = string
}

# ECS
variable "backend_container_port" {
  type    = number
  default = 8000
}

variable "desired_count" {
  type    = number
  default = 2
}

variable "task_cpu" {
  type    = number
  default = 256
}

variable "task_memory" {
  type    = number
  default = 512
}
