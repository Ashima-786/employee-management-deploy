#!/usr/bin/env python3
"""
Enterprise Traffic Simulation & Load Generator
Simulates active user sessions, employee CRUD operations, and generates realistic
traffic spikes to populate Prometheus metrics and Grafana dashboards.
"""

import time
import random
import requests
import sys

TARGET_HOST = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:5000"

SAMPLE_NAMES = [
    ("Aarav Patel", "DevOps Engineer", "Cloud Infra"),
    ("Sneha Sharma", "Frontend Lead", "UI/UX"),
    ("Rohan Verma", "Backend Engineer", "API Platform"),
    ("Priya Nair", "QA Automation", "Quality"),
    ("Vikram Singh", "Security Analyst", "SecOps"),
    ("Ananya Roy", "Product Manager", "Strategy"),
]

def generate_employee():
    name, role, team = random.choice(SAMPLE_NAMES)
    emp_id = name.lower().replace(" ", "_") + "_" + str(random.randint(100, 999))
    return {
        "id": emp_id,
        "name": name,
        "role": role,
        "team": team,
        "initials": "".join([part[0] for part in name.split()]).upper(),
        "color": random.choice(["blue", "green", "amber", "rose", "violet"]),
        "activeTasks": random.randint(1, 8),
        "priorityTasks": random.randint(0, 3),
        "commitments": random.randint(1, 5),
        "meetings": random.randint(1, 6),
        "workload": random.choice(["Balanced", "Elevated", "High"])
    }

def main():
    print(f"🚀 Starting Enterprise Load Simulation targeting: {TARGET_HOST}")
    print("Press Ctrl+C to stop.\n")
    
    created_ids = []

    while True:
        try:
            # 1. Health check simulation
            res = requests.get(f"{TARGET_HOST}/api/health", timeout=3)
            print(f"[GET /health] Status: {res.status_code}")

            # 2. Query all employees
            res = requests.get(f"{TARGET_HOST}/api/employees", timeout=3)
            print(f"[GET /employees] Status: {res.status_code}")

            # 3. Periodically create an employee
            if random.random() < 0.4:
                payload = generate_employee()
                res = requests.post(f"{TARGET_HOST}/api/employees", json=payload, timeout=3)
                if res.status_code in [200, 201]:
                    created_ids.append(payload["id"])
                    print(f"✅ [POST /employees] Created: {payload['name']} ({payload['id']})")

            # 4. Periodically delete an employee
            if len(created_ids) > 5 and random.random() < 0.3:
                target_id = created_ids.pop(0)
                res = requests.delete(f"{TARGET_HOST}/api/employees/{target_id}", timeout=3)
                print(f"🗑️ [DELETE /employees] Removed: {target_id} (Status: {res.status_code})")

            # Sleep randomly to simulate human traffic patterns
            time.sleep(random.uniform(0.5, 2.0))

        except requests.exceptions.RequestException as e:
            print(f"⚠️ Request connection notice: {e}")
            time.sleep(3)

if __name__ == "__main__":
    main()

