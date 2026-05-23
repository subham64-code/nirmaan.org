#!/usr/bin/env bash
set -euo pipefail

# deploy_remote.sh
# Usage: ./deploy_remote.sh <user@host> <ghcr-owner> [--no-scp]
# Copies deploy/docker-compose.remote.yml to the remote host (unless --no-scp),
# pulls the latest images from GHCR and brings the compose stack up.

COMPOSE_LOCAL="deploy/docker-compose.remote.yml"
COMPOSE_REMOTE="/tmp/docker-compose.remote.yml"

if [ "$#" -lt 2 ]; then
  echo "Usage: $0 <user@host> <ghcr-owner> [--no-scp]"
  exit 2
fi

REMOTE="$1"
GHCR_OWNER="$2"
NO_SCP=false
if [ "${3:-}" = "--no-scp" ]; then
  NO_SCP=true
fi

if [ "$NO_SCP" = false ]; then
  if [ ! -f "$COMPOSE_LOCAL" ]; then
    echo "Local compose file not found: $COMPOSE_LOCAL"
    exit 1
  fi
  echo "Copying $COMPOSE_LOCAL -> $REMOTE:$COMPOSE_REMOTE"
  scp "$COMPOSE_LOCAL" "$REMOTE:$COMPOSE_REMOTE"
fi

echo "Connecting to $REMOTE to pull images and start compose stack..."
ssh "$REMOTE" bash -s <<EOF
set -e
echo "Pulling images from GHCR (owner: $GHCR_OWNER)"
docker pull ghcr.io/${GHCR_OWNER}/nirmaan-backend:latest || true
docker pull ghcr.io/${GHCR_OWNER}/nirmaan-frontend:latest || true
docker pull ghcr.io/${GHCR_OWNER}/nirmaan-proctoring:latest || true

if [ -f "$COMPOSE_REMOTE" ]; then
  echo "Using compose file: $COMPOSE_REMOTE"
  docker compose -f "$COMPOSE_REMOTE" pull || true
  docker compose -f "$COMPOSE_REMOTE" up -d --remove-orphans
  echo "Services:"
  docker compose -f "$COMPOSE_REMOTE" ps
else
  echo "Compose file not found at $COMPOSE_REMOTE"
  exit 1
fi
EOF

echo "Deploy finished (check remote logs with: ssh $REMOTE 'docker compose -f $COMPOSE_REMOTE logs -f')"
