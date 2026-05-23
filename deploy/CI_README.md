CI build & push
----------------

This workflow builds Docker images for `backend`, `frontend`, and `proctoring` (from `nirmaan_exam.org`) and pushes them to GHCR (GitHub Container Registry).

Required repo secret:
Required repo secrets:
- `GHCR_TOKEN` — a personal access token with `write:packages` and `read:packages` (you can try using the default `GITHUB_TOKEN`, but if push fails create a PAT and set this secret).

For automatic deploy (SSH) the workflow needs these additional secrets:
- `DEPLOY_HOST` — remote host IP or DNS name
- `DEPLOY_USER` — SSH user
- `DEPLOY_SSH_KEY` — SSH private key (PEM) for `DEPLOY_USER` without passphrase
- `DEPLOY_SSH_PORT` — optional SSH port (defaults to `22`)
- `DEPLOY_PATH` — path on the remote host where the repo (containing `deploy/docker-compose.remote.yml`) is located (defaults to the remote user's home directory)

Usage:

Notes:
- The deploy job runs only on pushes to `main`.
- Ensure the remote host has Docker Engine and Docker Compose v2 (`docker compose`) installed and that the `DEPLOY_USER` can run Docker commands (via group membership or sudo without password).

Next steps for deployment:
- Update your remote `deploy/docker-compose.remote.yml` `image:` fields to point to the GHCR image names (they already use `ghcr.io/${GITHUB_OWNER}` — set that to your org/user when deploying).
- Pull and run on the remote host with `docker compose pull` and `docker compose up -d`.
