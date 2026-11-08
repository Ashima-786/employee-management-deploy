# Default / Custom VPC Lookup
data "aws_vpc" "default" {
  default = true
}

# Stateful Security Group Rules for Edge Proxy & SSH
resource "aws_security_group" "enterprise_sg" {
  name        = "enterprise-devops-sg"
  description = "Security Group for Enterprise DevOps Workspace"
  vpc_id      = data.aws_vpc.default.id

  # Administrative SSH
  ingress {
    description = "Encrypted SSH Access"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Public HTTP Edge Tier (Nginx)
  ingress {
    description = "Public HTTP Edge Proxy"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Direct Frontend Debug (Port 8081)
  ingress {
    description = "Direct Frontend Debug"
    from_port   = 8081
    to_port     = 8081
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Grafana Monitoring (Port 3002)
  ingress {
    description = "Grafana Observability Portal"
    from_port   = 3002
    to_port     = 3002
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Prometheus Direct Portal (Port 9090)
  ingress {
    description = "Prometheus Metrics Server"
    from_port   = 9090
    to_port     = 9090
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Jenkins CI/CD Automation Portal (Port 8080)
  ingress {
    description = "Jenkins CI/CD Automation Server"
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Outbound egress to internet
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "enterprise-devops-sg"
    Environment = "production"
  }
}

# Latest Ubuntu 24.04 LTS AMI Lookup
data "aws_ami" "ubuntu" {
  most_recent = true
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"]
  }
  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
  owners = ["099720109477"] # Canonical
}

# EC2 Instance Resource
resource "aws_instance" "app_server" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = var.instance_type
  key_name      = var.key_name

  vpc_security_group_ids = [aws_security_group.enterprise_sg.id]

  root_block_device {
    volume_size           = var.volume_size
    volume_type           = "gp3"
    delete_on_termination = true
    tags = {
      Name = "enterprise-root-disk"
    }
  }

  user_data = <<-EOF
              #!/bin/bash
              fallocate -l 2G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=2048
              chmod 600 /swapfile
              mkswap /swapfile
              swapon /swapfile
              echo '/swapfile none swap sw 0 0' >> /etc/fstab
              sysctl vm.swappiness=10
              echo 'vm.swappiness=10' >> /etc/sysctl.conf
              EOF

  tags = {
    Name        = "enterprise-devops-host"
    Environment = "production"
    ManagedBy   = "Terraform"
  }
}

