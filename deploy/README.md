# Deployment guide

This document describes how to run the project locally with Docker Compose and how to publish images to GitHub Container Registry (GHCR) for remote deployment.

Prerequisites
- Docker / Docker Compose (for local run)
- A GitHub repository and GHCR access (for remote deploy)
- `GHCR_PAT` secret with write:packages permission stored in repository secrets
- `GITHUB_OWNER` repository owner/org name set in repository secrets

Local (development) - quick start
1. From the project root run:

```powershell
docker compose up --build

# or run detached
docker compose up --build -d
```

2. Services:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Proctoring: http://localhost:5001

Publishing images to GHCR (CI)
- The repository contains a GitHub Actions workflow at `.github/workflows/build-and-push.yml` that builds and pushes three images:
  - `nirmaan-backend`
  - `nirmaan-frontend`
  - `nirmaan-proctoring`

Set these repository secrets before running the workflow:
- `GHCR_PAT` — a Personal Access Token with `write:packages` scope (or use a PAT that your org permits)
- `GITHUB_OWNER` — your username or organization (used to tag images)
For automatic remote deploy, also set these repository secrets:
- `REMOTE_HOST` — public IP or hostname of the target server
- `REMOTE_USER` — SSH user on the remote server
- `REMOTE_SSH_KEY` — SSH private key (PEM) for `REMOTE_USER` (keep it secret)
- `REMOTE_SSH_PORT` — optional SSH port (default 22)
- `REMOTE_PUBLIC_URL` — public URL or host to run smoke tests against (e.g., `http://example.com`)

The repository contains a deployment workflow `.github/workflows/deploy-and-smoke.yml` that runs after the build-and-push workflow completes successfully. It will:

- upload `deploy/docker-compose.remote.yml` to the remote host
- SSH into the host, log into GHCR with `GHCR_PAT`, pull images, and run `docker compose up -d`
- run the smoke tests from the repository against `REMOTE_PUBLIC_URL`

Remote deployment
1. Push images via the workflow or build locally and push to GHCR.
2. On the remote host (server with Docker) place `deploy/docker-compose.remote.yml` and ensure `GITHUB_OWNER` is set in the environment or the file is updated.
3. Run on remote host:

```bash
export GITHUB_OWNER=your-github-org-or-username
docker compose -f deploy/docker-compose.remote.yml up -d
```

Post-deploy checks
- `docker ps` shows running containers
- Check the service endpoints in step Local (development)

If you'd like, I can:
- create a small smoke-test script to verify the three HTTP endpoints (added at `scripts/smoke_test.sh` and `scripts/smoke_test.ps1`), and
- help you set repository secrets and trigger the workflow.

Setting repository secrets
- In GitHub go to `Settings` → `Secrets` → `Actions` and add:
  - `GHCR_PAT`: a Personal Access Token with `write:packages` scope (used to push images to GHCR)
  - `GITHUB_OWNER`: your GitHub username/org (used as image owner in tags)

Triggering the build workflow
- From the GitHub UI: open `Actions` → select `Build and Push Docker images` → `Run workflow`.
- From your machine using `gh` CLI:

```bash
# authenticate with GitHub CLI if needed
gh auth login

# trigger workflow on default branch
gh workflow run build-and-push.yml
```

Running smoke tests
- Locally (after `docker compose up -d`):

```bash
./scripts/smoke_test.sh
# or on Windows PowerShell
.\scripts\smoke_test.ps1
```

The smoke tests attempt GET requests to the frontend (`:3000`), backend (`:5000`) and proctoring (`:5001`).
