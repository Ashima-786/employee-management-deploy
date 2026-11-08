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

