#!/usr/bin/env bash
# Pull the latest image on the server and restart. Usage: deploy/deploy.sh [ssh-host]
set -euo pipefail
host="${1:-rainyun}"
ssh "$host" 'cd /opt/pkuharness-website && docker compose pull website && docker compose up -d website && docker image prune -f'
