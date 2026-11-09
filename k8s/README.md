# ☸️ Kubernetes Cluster Orchestration & Minikube

This directory provides production Kubernetes manifests for deploying the **Enterprise AI Workspace** stack onto local Minikube or managed AWS EKS clusters.

---

## 📁 Manifest Suite Structure

| Manifest | Purpose |
|---|---|
| [`01-namespace.yaml`](file:///d:/Projects/AWS_Devops_Employee_Mang/k8s/01-namespace.yaml) | Defines the isolated `enterprise-workspace` namespace |
| [`02-config-secrets.yaml`](file:///d:/Projects/AWS_Devops_Employee_Mang/k8s/02-config-secrets.yaml) | ConfigMaps for environment variables and base64-encoded Secrets |
| [`03-mongo-statefulset.yaml`](file:///d:/Projects/AWS_Devops_Employee_Mang/k8s/03-mongo-statefulset.yaml) | StatefulSet for MongoDB with Headless Service and 5Gi PersistentVolumeClaim |
| [`04-backend-deployment.yaml`](file:///d:/Projects/AWS_Devops_Employee_Mang/k8s/04-backend-deployment.yaml) | 3 Replicas with Liveness & Readiness probes (`/api/health`) and ClusterIP |
| [`05-frontend-deployment.yaml`](file:///d:/Projects/AWS_Devops_Employee_Mang/k8s/05-frontend-deployment.yaml) | 2 Replicas serving SPA frontend via NodePort on port 30080 |
| [`06-hpa.yaml`](file:///d:/Projects/AWS_Devops_Employee_Mang/k8s/06-hpa.yaml) | Horizontal Pod Autoscalers dynamically scaling 2–10 replicas on CPU/Memory load |

---

## 🚀 Deployment Instructions

### 1. Launch Minikube
```bash
# Start Minikube with Docker driver and 2GB RAM
minikube start --driver=docker --memory=2048m --cpus=2

# Enable Metrics Server (Required for HPA autoscaling)
minikube addons enable metrics-server
```

### 2. Apply Manifests
```bash
# 1. Create namespace
kubectl apply -f k8s/01-namespace.yaml

# 2. Apply all resources
kubectl apply -f k8s/

# 3. Verify running workloads
kubectl get pods,deployments,statefulset,svc,hpa -n enterprise-workspace
```

### 3. Open Minikube Visual Dashboard
```bash
minikube dashboard
```
Select the **`enterprise-workspace`** namespace from the top navigation to view live pod graphs, memory metrics, and autoscaler status.

### 4. Access Frontend Web Service
```bash
minikube service frontend-service -n enterprise-workspace
```

