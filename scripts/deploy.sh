#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$REPO_ROOT/scripts/ops/lib/common.sh"

for env_file in "$REPO_ROOT/apps/api/.env" "$REPO_ROOT/apps/web/.env"; do
  if [[ ! -f "$env_file" ]]; then
    echo "Arquivo obrigatório ausente: $env_file" >&2
    exit 1
  fi
  if grep -Eq '^[A-Z0-9_]+=.*CHANGE_ME' "$env_file"; then
    echo "Substitua todos os valores CHANGE_ME em $env_file antes do deploy." >&2
    exit 1
  fi
done

api_secret="$(sed -n 's/^INTERNAL_API_SECRET=//p' "$REPO_ROOT/apps/api/.env" | head -n 1)"
web_secret="$(sed -n 's/^INTERNAL_API_SECRET=//p' "$REPO_ROOT/apps/web/.env" | head -n 1)"
if [[ -z "$api_secret" || "$api_secret" != "$web_secret" ]]; then
  echo "INTERNAL_API_SECRET precisa ser não vazio e igual nos dois arquivos .env." >&2
  exit 1
fi

docker compose version >/dev/null
compose --parallel 1 up --build -d
