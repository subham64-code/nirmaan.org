#!/usr/bin/env bash
set -euo pipefail

# Simple smoke test for Nirmaan services
# Usage: ./scripts/smoke_test.sh [host_prefix]
# Example: ./scripts/smoke_test.sh http://localhost

HOST=${1:-http://localhost}

declare -a endpoints=(
  "$HOST:3000/"
  "$HOST:5000/"
  "$HOST:5001/"
)

echo "Running smoke tests against: ${HOST}"
all_ok=true

for url in "${endpoints[@]}"; do
  echo -n "Checking ${url} ... "
  if curl -sSf --max-time 10 "$url" >/dev/null; then
    echo "OK"
  else
    echo "FAIL"
    all_ok=false
  fi
done

if [ "$all_ok" = true ]; then
  echo "All smoke tests passed."
  exit 0
else
  echo "One or more smoke tests failed." >&2
  exit 2
fi
