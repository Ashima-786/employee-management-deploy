output "instance_id" {
  description = "EC2 Instance ID"
  value       = aws_instance.app_server.id
}

output "public_ip" {
  description = "Public IPv4 Address of the EC2 instance"
  value       = aws_instance.app_server.public_ip
}

output "public_dns" {
  description = "Public DNS of the EC2 instance"
  value       = aws_instance.app_server.public_dns
}

output "web_url" {
  description = "Primary Web Application URL"
  value       = "http://${aws_instance.app_server.public_ip}"
}

output "grafana_url" {
  description = "Grafana Observability Dashboard URL"
  value       = "http://${aws_instance.app_server.public_ip}:3002"
}
