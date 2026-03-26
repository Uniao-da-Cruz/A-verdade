"""Utility script to create or reuse a demo SaaS account and print its access token."""

import os
import sys

import requests

BASE_URL = os.getenv("VIGILIA_API_URL", "http://localhost:8000/api")
DEMO_EMAIL = os.getenv("VIGILIA_DEMO_EMAIL", "demo@vigilia.app")
DEMO_PASSWORD = os.getenv("VIGILIA_DEMO_PASSWORD", "demo12345")
PAYLOAD = {
    "full_name": os.getenv("VIGILIA_DEMO_NAME", "Demo Operator"),
    "workspace_name": os.getenv("VIGILIA_DEMO_WORKSPACE", "Demo Workspace"),
    "email": DEMO_EMAIL,
    "password": DEMO_PASSWORD,
}


def authenticate():
    register = requests.post(f"{BASE_URL}/auth/register", json=PAYLOAD, timeout=15)
    if register.status_code == 201:
        return register.json(), "registered"
    if register.status_code != 409:
        raise RuntimeError(f"Registration failed: {register.status_code} {register.text}")

    login = requests.post(
        f"{BASE_URL}/auth/login",
        json={"email": DEMO_EMAIL, "password": DEMO_PASSWORD},
        timeout=15,
    )
    if login.status_code != 200:
        raise RuntimeError(f"Login failed: {login.status_code} {login.text}")
    return login.json(), "logged-in"


def main() -> int:
    try:
        data, mode = authenticate()
    except Exception as exc:
        print(f"❌ {exc}")
        return 1

    print(f"✅ Demo account {mode} successfully")
    print(f"Workspace: {data['workspace']['name']} ({data['workspace']['slug']})")
    print(f"Email: {DEMO_EMAIL}")
    print(f"Password: {DEMO_PASSWORD}")
    print(f"Access token: {data['access_token'][:40]}...")
    return 0


if __name__ == "__main__":
    sys.exit(main())
