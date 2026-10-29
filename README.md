# 🏢 Enterprise AI Workspace

> A production-ready, containerized employee management platform. Built with React/Node and deployed on AWS EC2 via an automated GitHub Actions CI/CD pipeline.

🌐 **Live Deployment:** [http://13.60.211.165:8081](http://13.60.211.165:8081)

---

## 🏗️ Cloud Architecture

```mermaid
flowchart LR
    GitHub["GitHub Actions"] -- "Automated SSH" --> EC2["AWS EC2 Host (13.60.211.165)"]
    EC2 --> Frontend["Frontend Container (Port 8081)"]
    EC2 --> Backend["Backend Container (Port 5000)"]
    Frontend -. "Auth" .-> Supabase[("Supabase (JWT)")]
    Backend -. "State" .-> Mongo[("MongoDB Atlas")]
🎯 Key DevOps Features
Automated CI/CD Pipeline: Zero-touch deployments to AWS upon pushing to the main branch.

Zero-Cost Infrastructure: 100% contained within the AWS, MongoDB, and Supabase Free Tiers.

Memory Optimization: 2GB OS swap space configured to prevent Node/Vite build crashes (OOM kills).

Decoupled State: Container compute is strictly stateless; data is securely managed by external cloud clusters.

🚀 Local Quick Start
Bash
git clone [https://github.com/Ashima-786/employee-management-deploy.git](https://github.com/Ashima-786/employee-management-deploy.git)
cd employee-management-deploy
docker compose up --build -d

### How to Push It Successfully

To bypass the `rejected` error you got earlier and get this clean README onto GitHub, run these two commands in your PowerShell terminal:

```powershell
git pull --rebase origin main
git push origin main
