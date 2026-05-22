This repository includes a GitHub Actions workflow to build and push Docker images to GitHub Container Registry (GHCR), a workflow to deploy the remote compose file to a server via SSH, and a remote Docker Compose file to run those images on a server.

Required repository secrets (set in GitHub Settings → Secrets):
- `SSH_PRIVATE_KEY` — private key for the deploy user (no passphrase), used by the actions.
- `SSH_HOST` — IP or hostname of the target server.
- `SSH_USER` — username for SSH on the target server.
- `SSH_PORT` — optional, default 22.
- `GITHUB_OWNER` — your GitHub username or organization that owns the images.

Quick deploy steps:

1. Push your repo to GitHub (main branch).

2. Ensure the build workflow `.github/workflows/build-and-push.yml` runs successfully and images are available at `ghcr.io/<GITHUB_OWNER>/nirmaan-*-latest`.

3. Add the required secrets listed above in the repository settings.

4. From Actions tab, run the `Deploy remote Docker Compose` workflow manually, or trigger it by pushing to `main`.

What the deploy workflow does:
- Copies `deploy/docker-compose.remote.yml` to the remote host (`~/nirmaan_deploy/docker-compose.remote.yml`).
- Runs `docker compose -f docker-compose.remote.yml pull` and `docker compose -f docker-compose.remote.yml up -d` on the server.

Server prerequisites:
- Docker Engine and Docker Compose (v2) installed and available as `docker compose`.
- The deploy user must be able to run Docker (either root or in `docker` group).
- Open ports for the services (27017, 3000, 5000, 5001) as appropriate.

Manual server deployment (if you prefer to run locally on the server):

```bash
# on the server
mkdir -p ~/nirmaan_deploy
curl -o ~/nirmaan_deploy/docker-compose.remote.yml \
  https://raw.githubusercontent.com/<your-repo-owner>/<your-repo-name>/main/deploy/docker-compose.remote.yml
export GITHUB_OWNER=your-gh-username-or-org
GITHUB_OWNER=$GITHUB_OWNER docker compose -f ~/nirmaan_deploy/docker-compose.remote.yml pull
GITHUB_OWNER=$GITHUB_OWNER docker compose -f ~/nirmaan_deploy/docker-compose.remote.yml up -d
```

Env files:
- This repo references `.env` files at `backend/.env`, `frontend/.env`, and `nirmaan_exam.org/.env`. Provide equivalents on the server (e.g., as `~/nirmaan_deploy/backend.env`) and adjust the compose file to load them, or bake secrets into your deployment pipeline.

Troubleshooting:
- If Actions fails to authenticate to GHCR, ensure the build workflow successfully logged in and your account has permission to push packages.
- For SSH errors, verify `SSH_PRIVATE_KEY` matches the remote deploy user's `~/.ssh/authorized_keys` entry and `SSH_HOST`/`SSH_USER` are correct.
