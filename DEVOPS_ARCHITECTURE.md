# 🏗️ Enterprise DevOps Architecture

This document provides a comprehensive blueprint of the end-to-end continuous integration, continuous delivery, infrastructure provisioning, and observability architecture for the **Enterprise AI Workspace (Employee Management Platform)**.

---

## 🌐 End-to-End Pipeline & Deployment Flow

```mermaid
flowchart TD
    DEV["👨‍💻 Developer\nLocal Machine"] -->|git push| GH["🐙 GitHub\nmain branch"]

    GH -->|webhook| JENKINS["🔧 Jenkins LTS\n8-Stage Declarative Pipeline"]
    GH -->|trigger| GHA["⚙️ GitHub Actions\nCloud CI/CD Workflow"]

    subgraph CI["CI & DevSecOps Validation"]
        JENKINS -->|parallel test| TEST["🧪 Automated Tests\nJest & TypeScript"]
        JENKINS -->|Trivy audit| TRIVY["🛡️ Aqua Trivy\nFilesystem & Container Scan"]
        GHA --> TRIVY
    end

    subgraph BUILD["Containerization & Registry"]
        TRIVY -->|build| DOCKER["🐳 Multi-Stage Docker Build\nFrontend & Backend"]
        DOCKER -->|publish| DH["📦 Docker Hub\nshoyo44/employee-*"]
        DOCKER -->|publish| ECR["📦 AWS ECR\nPrivate Registry"]
    end

    subgraph PROV["Infrastructure as Code & Configuration"]
        TF["🏗️ Terraform\nVPC, EC2, SG, gp3 Disk"]
        ANSIBLE["📜 Ansible Engine\nIdempotent Host Provisioning"]
        TF -->|provisions host| EC2
        ANSIBLE -->|configures & deploys| EC2
    end

    subgraph EC2["☁️ AWS EC2 Host — Ubuntu 24.04 (98.84.183.69)"]
        PROXY["🌐 Nginx 1.27 Edge Proxy\n:80"]
        FRONT["⚛️ React SPA / SSR\n:8080"]
        BACK["🚀 Node / Express API\n:5000"]
        MONGO[("🍃 MongoDB 7.0\n:27017")]
        PROM["📊 Prometheus\n:9090 (/prometheus)"]
        GRAF["📈 Grafana 10.4\n:3002 (/grafana)"]
        JENK["🛠️ Jenkins Server\n:8080"]

        PROXY --> FRONT
        PROXY --> BACK
        PROXY --> PROM
        PROXY --> GRAF
        BACK --> MONGO
        PROM -->|scrape /metrics| BACK
        GRAF -->|query| PROM
    end

    DH -->|docker compose pull| EC2
    ECR -->|docker pull| EC2

    subgraph K8S["☸️ Kubernetes Cluster (Minikube / EKS)"]
        NS["Namespace: enterprise-workspace"]
        FE_K8S["Frontend Deployment (HPA 2-10)"]
        BE_K8S["Backend Deployment (HPA 2-10)"]
        DB_K8S["MongoDB StatefulSet + 5Gi PVC"]
        HPA["Horizontal Pod Autoscaler"]
        
        FE_K8S --> BE_K8S
        BE_K8S --> DB_K8S
        HPA -.->|scales| FE_K8S
        HPA -.->|scales| BE_K8S
    end
```

---

## 🔒 Security & Traffic Boundaries

1. **Edge Proxy Boundary**:
   - Only ports `80` (HTTP), `22` (SSH), `3002` (Grafana), `8080` (Jenkins), and `9090` (Prometheus) are reachable externally.
   - Internal microservices (`mongo:27017` and `backend:5000`) communicate exclusively over the private Docker bridge network (`enterprise_net`).
2. **Shift-Left DevSecOps**:
   - Vulnerability scanning is enforced automatically during code check-in and before image promotion.
3. **Resilience & Swap Hardening**:
   - The Linux kernel is tuned with a 2 GB persistent swapfile and `vm.swappiness=10` to guarantee memory stability during high-throughput loads on AWS Free Tier instances.

