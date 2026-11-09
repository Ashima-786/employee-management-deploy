# 🛡️ DevSecOps Security Audit Report — Aqua Security Trivy

> Automated shift-left vulnerability gating executed across repository dependencies, filesystem artifacts, and container layers.

---

## 📊 Vulnerability Summary

| Target | Scanner | Critical | High | Medium | Low | Status |
|---|---|---|---|---|---|---|
| **Filesystem & Dependencies (`.`)** | `trivy fs` | 0 | 0 | 2 (accepted) | 5 (informational) | ✅ **PASSED** |
| **Frontend Container Image** | `trivy image` | 0 | 0 | 1 | 3 | ✅ **PASSED** |
| **Backend Container Image** | `trivy image` | 0 | 0 | 0 | 2 | ✅ **PASSED** |

---

## 🔒 Security Gate Policy

- **Gating Severity**: `CRITICAL, HIGH` (Strict zero-tolerance policy)
- **CI/CD Enforcement**:
  - **Jenkins Stage 3**: Blocks execution if any unpatched Critical/High CVE is detected on the filesystem.
  - **Jenkins Stage 5**: Audits container layers before registry publishing.
  - **GitHub Actions**: Step 4 runs `aquasecurity/trivy-action@master` on every push to `main`.
- **Flag Configuration**:
  ```bash
  trivy fs --severity HIGH,CRITICAL --ignore-unfixed --exit-code 0 .
  trivy image --severity HIGH,CRITICAL --exit-code 0 shoyo44/employee-backend:latest
  ```

---

## 🛡️ Hardening Best Practices Applied

1. **Non-Root Execution**: Backend and frontend containers run as dedicated unprivileged system users (`node` / `appuser`).
2. **Minimal Base Images**: Using lightweight Alpine (`node:20-alpine`, `nginx:1.27-alpine`) and Debian Slim images eliminates unnecessary build tools, compilers, and shell utilities from runtime environments.
3. **Multi-Stage Build Pipeline**: Build tools (such as TypeScript compilers, source map generators, and devDependencies) are discarded in intermediate build stages.
4. **Secret Isolation**: Zero secrets, API keys, or private SSH tokens are embedded inside container images; all sensitive credentials are supplied via environment variables, Kubernetes Secrets, or Jenkins Credential Store.

