variable "aws_region" {
  description = "Target AWS deployment region"
  type        = string
  default     = "us-east-1"
}

variable "instance_type" {
  description = "AWS EC2 instance type (Free Tier eligible)"
  type        = string
  default     = "t3.micro"
}

variable "key_name" {
  description = "AWS SSH Key Pair name"
  type        = string
  default     = "devops-key"
}

variable "volume_size" {
  description = "Root gp3 volume size in GB"
  type        = number
  default     = 20
}

variable "project_name" {
  description = "Name prefix for enterprise infrastructure resources"
  type        = string
  default     = "enterprise-workspace"
}

variable "environment" {
  description = "Target deployment environment"
  type        = string
  default     = "production"
}

variable "vpc_cidr" {
  description = "CIDR block for the custom VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_1_cidr" {
  description = "CIDR block for public subnet 1 (AZ-a)"
  type        = string
  default     = "10.0.1.0/24"
}

variable "public_subnet_2_cidr" {
  description = "CIDR block for public subnet 2 (AZ-b)"
  type        = string
  default     = "10.0.2.0/24"
}

