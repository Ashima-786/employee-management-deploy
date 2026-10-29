🏢 Enterprise AI Workspace – DevOps & Cloud ArchitectureA proactive, containerized full-stack employee management platform built with React TypeScript, Vite, Node.js/Express, and MongoDB Atlas, secured by Supabase Auth. Deployed via an automated GitHub Actions CI/CD pipeline to a hardened AWS EC2 instance running within a $0.00 Free Tier footprint.🌐 Live Production Deployment: http://13.60.211.165:8081🏗️ DevOps, CI/CD & Cloud ArchitectureCode snippetflowchart TD
    subgraph GitHub["GitHub & CI/CD"]
        Repo["Source Code (Main Branch)"]
        Actions["GitHub Actions Workflow<br/>(deploy.yml)"]
    end

    subgraph AWSCloud["AWS EC2 Host (Ubuntu | t2/t3.micro | 13.60.211.165)"]
        subgraph HostOS["Host Resources & Safeguards"]
            RAM["Physical RAM: 1 GB"]
            Swap["Swap Space: 2 GB (/swapfile)"]
        end

        subgraph DockerBridge["Docker Compose Network"]
            Frontend["enterprise-frontend<br/>(Vite Build + Static Serving)<br/>Host Port 8081 -> Container 8081"]
            Backend["enterprise-backend<br/>(Node.js + Express REST API)<br/>Host Port 5000 -> Container 5000"]
        end
    end

    subgraph ExternalServices["External Managed Cloud Services"]
        Mongo[("MongoDB Atlas<br/>(M0 Free Cluster)")]
        Supabase[("Supabase Auth<br/>(PostgreSQL + JWT)")]
    end

    Repo -- "git push" --> Actions
    Actions -- "Secure SSH via GitHub Secrets" --> AWSCloud
    Browser["User Browser"] -->|HTTP Port 8081| Frontend
    Frontend -->|API Requests Port 5000| Backend
    Backend -->|Mongoose Connection| Mongo
    Frontend -->|Client-Side Auth| Supabase
🎯 Key DevOps Features & Engineering HighlightsFeatureDevOps ImplementationBenefitAutomated CI/CD PipelineGitHub Actions (appleboy/ssh-action) triggered on git push mainZero-touch continuous deployment directly from VS Code to AWS.Memory Engineering2 GB swap file provisioned on EC2 hostPrevents SIGKILL OOM crashes during heavy Vite JavaScript bundling.Serverless Database & AuthDecoupled state using MongoDB Atlas & SupabaseContainer compute is strictly stateless, ensuring zero data loss if containers are destroyed.Clean Session ManagementAggressive localStorage cache clearing on sign-outPrevents stale browser sessions and enables flawless multi-tenant account switching.Multi-Stage Build PreparationCache-free Docker builds (--no-cache) integrated into the deployment scriptEnsures UI changes and environment variables reflect instantly in production.Zero Cost Architecture100% within AWS Free Tier, MongoDB Atlas M0, and Supabase Free Tier$0.00 / month operational cost🚀 Continuous Deployment (CI/CD) WorkflowThis project utilizes a fully automated deployment pipeline. You do not need to manually SSH into the server to deploy updates.1. Triggering a Production DeploymentFrom your local development environment (VS Code), simply commit and push your changes to the main branch:Bashgit add .
git commit -m "feat: Add new workload intelligence metrics"
git push origin main
2. What Happens in the Background (GitHub Actions)GitHub Actions detects the push and spins up an ubuntu-latest runner.It securely connects to the AWS EC2 instance (13.60.211.165) using stored repository secrets (AWS_HOST, AWS_USER, AWS_SSH_KEY).It navigates to the project directory, pulls the latest code, and executes a clean, cache-free Docker Compose rebuild.View live deployment logs in the Actions tab of the GitHub repository.💰 AWS & Cloud Cost Analysis ($0.00 Free Tier Budget)Resource / ServiceAllocated TierMonthly UsageCostAWS EC2 Computet2.micro or t3.micro750 hours (Free Tier)$0.00AWS EBS Storage20 GB gp3< 30 GB limit (Free Tier)$0.00MongoDB AtlasM0 Sandbox Cluster< 512 MB Storage$0.00Supabase AuthFree Tier Project< 50,000 MAU$0.00Total Estimated Cost$0.00📁 Repository StructurePlaintextAWS_Devops_Employee_Mang/
├── .github/
│   └── workflows/
│       └── deploy.yml              # GitHub Actions CI/CD Pipeline Configuration
├── backend/
│   ├── models/                     # MongoDB Mongoose Schemas (Workspace, Employee)
│   ├── routes/                     # Express API Routes
│   ├── server.js                   # Node.js backend entry point
│   ├── Dockerfile                  # Backend container configuration
│   └── package.json
├── src/
│   ├── components/                 
│   │   ├── ui/                     # Reusable Shadcn UI components
│   │   └── workspace.tsx           # Core application dashboard and logic
│   ├── integrations/
│   │   └── supabase/               # Supabase client and auth middleware
│   ├── lib/                        # Utility functions and shared types
│   ├── routes/                     # TanStack Router configuration
│   └── main.tsx                    # React application entry point
├── Dockerfile                      # Frontend container configuration
├── docker-compose.yml              # Multi-container orchestration (Frontend + Backend)
├── package.json
└── vite.config.ts                  # Vite bundler configuration
🛠️ Operational Maintenance CommandsIf manual intervention on the AWS EC2 server is required, connect via SSH and use the following commands:Bash# Connect to the EC2 Instance
ssh -i "aws-devops-key.pem" ubuntu@13.60.211.165

# Navigate to the deployment directory
cd employee-management-deploy

# View live container status
sudo docker compose ps

# View real-time application logs (useful for debugging Node or Vite)
sudo docker compose logs -f --tail=100

# Force a clean manual rebuild (if CI/CD is bypassed)
sudo docker compose build --no-cache && sudo docker compose up -d
🔒 Security PostureSecrets Management: SSH keys and server IP addresses are strictly managed via GitHub Secrets and are never exposed in the codebase.Stateless Authentication: Enterprise identity is managed entirely off-server using Supabase's secure JWT infrastructure.Environment Isolation: API keys (Vite, MongoDB, Supabase) are injected at runtime via Docker .env files, preventing accidental exposure in source control.Aggressive Client Uncaching: handleSignOut strictly parses and removes all enterprise_auth_user and supabase.auth.token keys from browser local storage to prevent session fixation.
