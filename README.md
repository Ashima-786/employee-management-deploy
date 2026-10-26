# Employee Management System

A full-stack containerized enterprise workspace application designed to manage employee data, workspaces, and simulated commitment intelligence. This project demonstrates a modern cloud-native architecture using a decoupled frontend and backend, orchestrated with Docker, and deployed on an AWS EC2 instance.

## 🚀 Tech Stack & Architecture

- Frontend: React, TypeScript, Tailwind CSS, Vite
- Backend: Node.js, Express.js
- Database: MongoDB Atlas (Cloud Database) & Drizzle ORM setup
- Authentication: Supabase (Backend-as-a-Service)
- DevOps & Orchestration: Docker, Docker Compose
- Cloud Infrastructure: AWS EC2 (Ubuntu Linux)

## 📁 Project Directory Structure

pixel-perfect-recreation-502-main/
├── backend/                   # Node.js & Express API Server
│   ├── models/                # Database schemas (e.g., Workspace.js)
│   ├── routes/                # API route controllers (e.g., workspaceRoutes.js)
│   ├── server.js              # Main Express application entry point
│   ├── seed.js                # Database seeding script
│   ├── server.test.js         # Backend unit tests
│   ├── Dockerfile             # Container configuration for the backend
│   └── package.json           # Backend-specific dependencies
│
├── src/                       # React Frontend Application
│   ├── components/            # Reusable UI components
│   ├── pages/                 # Main application views
│   └── main.tsx               # React application entry point
│
├── public/                    # Static assets (images, icons, etc.)
├── supabase/                  # Supabase project configuration & edge functions
├── drizzle/                   # Drizzle ORM migrations and schemas
│
├── docker-compose.yml         # Multi-container orchestration (Frontend + Backend)
├── Dockerfile                 # Container configuration for the frontend
├── drizzle.config.ts          # Drizzle ORM configuration
├── package.json               # Root workspace and frontend dependencies
├── .env                       # Global environment variables (Ignored by Git)
└── README.md                  # Project documentation

✨ Key Features
Secure Authentication: Offloaded user management, password hashing, and session handling entirely to Supabase for enterprise-grade security.

Workspace Management: RESTful API architecture for creating, fetching, and managing organizational workspaces via /backend/routes/workspaceRoutes.js.

Commitment Intelligence UI: A sophisticated frontend demonstration of AI-driven meeting analysis and project commitment tracking.

Containerized Environment: Fully orchestrated multi-container setup eliminating the "it works on my machine" problem, ensuring exact parity between local development and production environments.

🛠️ Local Development Setup
Prerequisites
Docker & Docker Compose installed

A MongoDB Atlas cluster URI

A Supabase project with API credentials
