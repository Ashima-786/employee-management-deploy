# Enterprise AI Workspace — Cloud-Native DevOps Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js: v20](https://img.shields.io/badge/Node.js-v20-green.svg)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-Multi--Stage-blue.svg)](https://www.docker.com/)
[![AWS](https://img.shields.io/badge/AWS-Free%20Tier%20$0.00-orange.svg)](https://aws.amazon.com/)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-Minikube-326CE5.svg)](https://kubernetes.io/)
[![Prometheus](https://img.shields.io/badge/Prometheus-v2.50.1-E6522C.svg)](https://prometheus.io/)
[![Grafana](https://img.shields.io/badge/Grafana-10.4.0-F46800.svg)](https://grafana.com/)

An enterprise-grade, cloud-native DevOps blueprint demonstrating multi-tier containerization, automated Infrastructure as Code (Terraform), idempotent configuration management (Ansible), declarative 8-stage CI/CD pipelines (Jenkins + GitHub Actions), local Minikube Kubernetes orchestration with HPAs, and full-stack observability with Prometheus and Grafana.

---

## 🏛️ System Architecture

```mermaid
graph TD
    Client["🌐 Client Web Browser"] -->|Port 80 HTTP| Edge["🛡️ Nginx 1.27 Edge Proxy"]
    
    subgraph "Private Container Network (enterprise_net)"
        Edge -->|/ (Root)| Frontend["⚛️ React TanStack SSR :8080"]
        Edge -->|/api/*| Backend["🚀 Express.js REST API :5000"]
        Edge -->|/prometheus/*| Prom["📊 Prometheus :9090"]
        Edge -->|/grafana/*| Graf["📈 Grafana :3002"]
        
        Backend -->|Mongoose ODM| Mongo[("🍃 MongoDB Atlas / Local :27017")]
        Prom -->|Scrapes /metrics| Backend
        Graf -->|Datasource Query| Prom
    end
```

---

## 🚀 Key Modules & Capabilities

### 1. Hardened Multi-Stage Containerization
- **Frontend SPA**: Alpine-based SSR production build output served via Node standalone runtime.
- **Backend API**: Stateless Express REST service with Prometheus `/metrics` telemetry.
- **Daemon Logging Limits**: Configured `max-size: 10m` and `max-file: 3` to prevent disk exhaustion.
- **Unified Local & Production Compose**: Single entry point on port 80 backed by Nginx reverse proxy.

### 2. AWS Free Tier Zero-Cost ($0.00) Hardening
- **Compute**: Single `t3.micro` EC2 instance (1 vCPU, 1 GB RAM, Ubuntu 24.04 LTS).
- **Storage**: 20 GB gp3 root EBS volume (strictly within 30 GB Free Tier allowance).
- **Linux Memory Engineering**: Configured 2 GB persistent swapfile with kernel `vm.swappiness=10` to eliminate OOM killed processes during builds.

### 3. Infrastructure as Code (Terraform)
Located in [`terraform/`](file:///d:/Projects/AWS_Devops_Employee_Mang/terraform):
- `main.tf`: Provider version pinning.
- `variables.tf`: Configurable region, instance types, and storage parameters.
- `ec2.tf`: Security group ingress/egress rules, gp3 root device, and automated user-data swap creation.
- `outputs.tf`: Public IP, DNS, and web endpoints.

```bash
cd terraform
terraform init
terraform plan
terraform apply -auto-approve
```

### 4. Idempotent Configuration Management (Ansible)
Located in [`ansible/`](file:///d:/Projects/AWS_Devops_Employee_Mang/ansible):
- Installs Docker Engine and Docker Compose v2.
- Hardens system with 2 GB swapfile and swappiness tuning.
- Applies daemon logging rotation governance.
- Synchronizes repo and triggers automated smoke tests.

```bash
ansible-playbook -i ansible/inventory.ini ansible/deploy-playbook.yml
```

### 5. Declarative 8-Stage CI/CD Pipeline
Configured in [`Jenkinsfile`](file:///d:/Projects/AWS_Devops_Employee_Mang/Jenkinsfile):
1. **Checkout SCM**: Clones target Git repository.
2. **Code Quality & Tests**: Parallel execution of Jest unit tests and frontend validation.
3. **DevSecOps Filesystem Scan**: Trivy scan gating Critical & High CVEs.
4. **Docker Multi-Stage Build**: Builds production container images.
5. **Container Image Scan**: Trivy audit on container layers.
6. **Registry Publish**: Tags and pushes versioned images to Docker Hub.
7. **Terraform Validation**: Validates IaC configurations.
8. **EC2 Deploy & Smoke Test**: Deploys via SSH and executes automated HTTP 200 healthcheck.

### 6. Kubernetes Cluster Orchestration (Minikube)
Located in [`k8s/`](file:///d:/Projects/AWS_Devops_Employee_Mang/k8s):
- `01-namespace.yaml`: Dedicated `enterprise-workspace` namespace.
- `02-config-secrets.yaml`: ConfigMaps and base64 Secrets.
- `03-mongo-statefulset.yaml`: StatefulSet + 5Gi PVC + Headless Service.
- `04-backend-deployment.yaml`: Rolling updates with Liveness & Readiness probes.
- `05-frontend-deployment.yaml`: Replicated frontend with NodePort service.
- `06-hpa.yaml`: HorizontalPodAutoscalers scaling replicas dynamically based on CPU/Memory utilization.

```bash
kubectl apply -f k8s/01-namespace.yaml
kubectl apply -f k8s/
kubectl get all -n enterprise-workspace
```

### 7. Observability (Prometheus & Grafana)
- **Metrics Collected**:
  - `http_requests_total`
  - `http_request_duration_seconds` (p95 latency)
  - `workspace_employees_total` (Active employee gauge)
  - `workspace_employee_operations_total` (CRUD counters)
- **Grafana Provisioning**: Automated datasource creation and pre-built operational telemetry dashboards at [`http://localhost:3002`](http://localhost:3002).

### 8. Traffic Simulation & Demonstration Script
Generate realistic mock user traffic to populate Prometheus and Grafana meters:

```bash
python scripts/load_simulate.py http://localhost:5000
```
