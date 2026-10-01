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

log "Construindo as imagens da aplicação e do migrator."
compose --parallel 1 build
compose --profile migrate --parallel 1 build api-migrate

log "Iniciando os bancos da stack local e aguardando os healthchecks."
compose up -d --wait --wait-timeout 180 \
  postgres-core postgres-gamification postgres-achievements

log "Aplicando migrations nos bancos da mesma stack local."
compose --profile migrate run --no-deps --rm api-migrate

log "Iniciando a aplicação com as imagens já construídas."
compose --parallel 1 up --no-build -d
compose ps
