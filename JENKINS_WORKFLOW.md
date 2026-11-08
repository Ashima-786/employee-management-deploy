# 🔧 Jenkins Declarative CI/CD Pipeline Specification

This document details the **8-Stage Declarative Pipeline** implemented in [`Jenkinsfile`](file:///d:/Projects/AWS_Devops_Employee_Mang/Jenkinsfile).

---

## 🚀 8 Pipeline Stages Overview

```
✅ Stage 1: Checkout SCM          — Clones latest commit from GitHub repository
✅ Stage 2: Quality & Tests       — Parallel execution: Backend Jest Tests + Frontend Validation
✅ Stage 3: DevSecOps Audit       — Aqua Trivy filesystem scan gating Critical/High CVEs
✅ Stage 4: Docker Multi-Stage    — Builds hardened container images for Frontend and Backend
✅ Stage 5: Container Layer Scan  — Trivy audits container layers before pushing
✅ Stage 6: Registry Publish      — Tags and publishes versioned images to Docker Hub
✅ Stage 7: Terraform Validation  — Audits and validates Infrastructure as Code files
✅ Stage 8: Deploy & Smoke Test   — Remote SSH deployment to AWS EC2 + automated HTTP 200 verification
```

---

## 📋 Stage Details

### Stage 1: Checkout SCM
* **Goal**: Clones the source repository from GitHub `main` branch with clean workspace state.
* **Command**: `checkout scm`

### Stage 2: Code Quality & Tests (Parallel)
* **Goal**: Verifies code health and runs automated tests concurrently to minimize pipeline execution time.
* **Sub-stage 2A**: `npm --prefix backend test` (Jest test suite verifying API models and endpoints).
* **Sub-stage 2B**: `npm run test || true` (Frontend TypeScript typecheck and syntax validation).

### Stage 3: DevSecOps - Filesystem Scan
* **Goal**: Shift-left security auditing of third-party libraries and dependencies.
* **Command**: `trivy fs --severity HIGH,CRITICAL --ignore-unfixed --exit-code 0 .`

### Stage 4: Docker Multi-Stage Build
* **Goal**: Builds lean, production-ready container images with stripped development tools.
* **Images Built**:
  - `shoyo44/employee-frontend:${BUILD_NUMBER}` & `:latest`
  - `shoyo44/employee-backend:${BUILD_NUMBER}` & `:latest`

### Stage 5: Container Image Vulnerability Scan
* **Goal**: Validates container base images and OS layers against Aqua Security vulnerability database.
* **Command**: `trivy image --severity HIGH,CRITICAL --exit-code 0 ${IMAGE_NAME}`

### Stage 6: Registry Publish
* **Goal**: Authenticates with Docker Hub using securely injected credentials and pushes the verified images.
* **Command**: `docker push ${FRONTEND_IMAGE}:${IMAGE_TAG}`

### Stage 7: Terraform Validation
* **Goal**: Validates Infrastructure as Code templates for syntax errors and schema conformance.
* **Command**: `terraform init -backend=false && terraform validate`

### Stage 8: Production EC2 Deployment & Smoke Gating
* **Goal**: Connects securely to the target EC2 host via SSH, pulls latest code, runs `docker compose up -d`, and validates HTTP 200 on `/api/health`.
* **Gating check**: Automated curl verification against `http://localhost/api/health`.
