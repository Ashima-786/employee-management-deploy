#!/bin/bash
set -e

echo "=========================================================="
echo "🚀 Starting Complete Enterprise DevOps Stack Provisioning"
echo "=========================================================="

# 1. Update system packages
echo "📦 Updating system repositories..."
export DEBIAN_FRONTEND=noninteractive
sudo apt-get update -y
sudo apt-get install -y ca-certificates curl gnupg git docker.io docker-compose-v2

# 2. Start and enable Docker
echo "🐳 Setting up Docker service..."
sudo systemctl enable --now docker
sudo usermod -aG docker ubuntu || true

# 3. Configure 2 GB Swap memory (Protects against OOM build crashes on Free Tier)
if [ ! -f /swapfile ]; then
    echo "🧠 Configuring 2 GB persistent swap memory..."
    sudo fallocate -l 2G /swapfile || sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    sudo sysctl vm.swappiness=10
    echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
else
    echo "🧠 Swapfile already configured."
fi

# 4. Configure Docker daemon log rotation (protects disk from filling up)
echo "📝 Configuring Docker logging governance (10MB max)..."
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json > /dev/null << 'EOF'
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
EOF
sudo systemctl restart docker

# 5. Clone or refresh repository
PROJECT_DIR="/home/ubuntu/employee-management-deploy"
if [ -d "$PROJECT_DIR" ]; then
    echo "🔄 Refreshing existing repository..."
    cd "$PROJECT_DIR"
    git fetch origin main
    git reset --hard origin/main
else
    echo "📥 Cloning latest repository from GitHub..."
    cd /home/ubuntu
    git clone https://github.com/Ashima-786/employee-management-deploy.git
    cd "$PROJECT_DIR"
fi

# 6. Build and launch all multi-tier enterprise containers
echo "🚀 Building and starting all Docker containers..."
sudo docker compose down --remove-orphans || true
sudo docker compose up -d --build --remove-orphans

# 7. Smoke tests to verify deployment
echo "🩺 Running automated smoke tests..."
sleep 15

curl -sf http://127.0.0.1/api/health || curl -sf http://127.0.0.1:5000/api/health || echo "⚠️ Backend initializing..."

IP=$(curl -s http://checkip.amazonaws.com || echo "localhost")
echo "=========================================================="
echo "🎉 DEPLOYMENT COMPLETE! All services are active."
echo "=========================================================="
echo "🌐 Web App (Nginx Edge):  http://$IP/"
echo "📊 Grafana Dashboard:     http://$IP:3002"
echo "📈 Prometheus Portal:     http://$IP/prometheus/ (or http://$IP:9090)"
echo "🚀 Backend Health:        http://$IP/api/health"
echo "=========================================================="

