# 🏢 Enterprise AI Workspace

> A production-ready, containerized employee management platform. Built with React/Node and deployed on AWS EC2 via an automated GitHub Actions CI/CD pipeline.

🌐 **Live Deployment:** [http://13.60.211.165:8081](http://13.60.211.165:8081)

---

# 🏢 Enterprise AI Workspace

> A production-ready, containerized employee management platform. Built with React/Node and deployed on AWS EC2 via an automated GitHub Actions CI/CD pipeline.

🌐 **Live Deployment:** [http://13.60.211.165:8081](http://13.60.211.165:8081)

---

## 🏗️ Cloud Architecture

```mermaid
flowchart TD
    %% Define Nodes & Subgraphs
    Client[🖥️ User Browser]
    CI[⚙️ GitHub Actions CI/CD]

    subgraph AWS ["☁️ AWS EC2 Server (13.60.211.165)"]
        direction TB
        UI[⚛️ React Frontend<br/>Port 8081]
        API[🟢 Node.js Backend<br/>Port 5000]
    end

    subgraph DB ["🌍 Managed Cloud Services"]
        direction LR
        Auth[(🔐 Supabase Auth)]
        Atlas[(🍃 MongoDB Atlas)]
    end

    %% Connections
    Client -->|HTTP Request| UI
    CI -->|Automated SSH Deploy| AWS
    UI <-->|REST API| API
    UI -->|JWT Auth| Auth
    API -->|Mongoose DB| Atlas

    %% Styling
    style AWS fill:#f9f9f9,stroke:#333,stroke-width:2px
    style DB fill:#eef9fe,stroke:#333,stroke-width:2px
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
