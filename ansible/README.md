# 📜 Ansible Configuration Management & Deployment

Automated, idempotent host provisioning and application deployment for the AWS EC2 production environment.

---

## 📁 Architecture

- [`inventory.ini`](file:///d:/Projects/AWS_Devops_Employee_Mang/ansible/inventory.ini): Target hosts, SSH keys, and connection variables.
- [`deploy-playbook.yml`](file:///d:/Projects/AWS_Devops_Employee_Mang/ansible/deploy-playbook.yml): 9-step idempotent deployment playbook.

---

## 🛠️ Playbook Tasks

1. **System Packages**: Installs `ca-certificates`, `curl`, `gnupg`, `git`, and build tools.
2. **Docker Installation**: Adds official Docker APT repository and installs Docker Engine + Compose v2.
3. **Swap Memory Provisioning**: Allocates 2 GB persistent swapfile and tunes `vm.swappiness=10` to prevent OOM errors on Free Tier.
4. **Log Governance**: Configures `daemon.json` with 10MB file caps and 3 rotation backups.
5. **Git Synchronization**: Synchronizes repository code to `/home/ubuntu/employee-management-deploy`.
6. **Container Orchestration**: Runs `docker compose up -d --build --remove-orphans`.
7. **Automated Smoke Testing**: Executes health checks against `/api/health` and verifies HTTP 200 status.

---

## 🚀 Execution

```bash
# 1. Verify syntax
ansible-playbook -i ansible/inventory.ini ansible/deploy-playbook.yml --syntax-check

# 2. Execute idempotent provisioning
ansible-playbook -i ansible/inventory.ini ansible/deploy-playbook.yml
```
