# ⚛️ Enterprise AI Workspace — Frontend Tier

React 18 Single Page Application (SPA) built with TypeScript, TanStack Router, TailwindCSS, and SSR via Nitro Node server preset.

---

## 🏗️ Architecture

- **Engine**: React 18, TypeScript, Vite 8.
- **Routing**: TanStack Router (File-based file routes in `src/routes/`).
- **Telemetry & State**: Local storage session persistence with automatic resilient auth fallback.
- **Styling**: TailwindCSS with Radix UI accessible primitives and Lucide icons.
- **Containerization**: Multi-stage Docker build producing a lightweight `<50MB` Alpine production image.

---

## 🐳 Container Build

```bash
docker build -t shoyo44/employee-frontend:latest -f src/Dockerfile .
```

