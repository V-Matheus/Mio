#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

TAG="${1:-}"
if [[ ! "$TAG" =~ ^[0-9a-f]{40}$ ]]; then
  echo "Uso: $0 <SHA completo de 40 caracteres do commit>" >&2
  exit 1
fi
GHCR_NAMESPACE="${2:-}"
if [[ ! "$GHCR_NAMESPACE" =~ ^[a-z0-9][a-z0-9-]*$ ]]; then
  echo "Uso: $0 <SHA completo de 40 caracteres do commit> <namespace GHCR em minúsculas>" >&2
  exit 1
fi

for env_file in apps/api/.env apps/web/.env; do
  if [[ ! -f "$env_file" ]]; then
    echo "Arquivo obrigatório ausente: $env_file" >&2
    exit 1
  fi
  if grep -Eq '^[A-Z0-9_]+=.*CHANGE_ME' "$env_file"; then
    echo "Substitua todos os valores CHANGE_ME em $env_file antes do deploy." >&2
    exit 1
  fi
done

api_secret="$(sed -n 's/^INTERNAL_API_SECRET=//p' apps/api/.env | head -n 1)"
web_secret="$(sed -n 's/^INTERNAL_API_SECRET=//p' apps/web/.env | head -n 1)"
if [[ -z "$api_secret" || "$api_secret" != "$web_secret" ]]; then
  echo "INTERNAL_API_SECRET precisa ser não vazio e igual nos dois arquivos .env." >&2
  exit 1
fi

source "$REPO_ROOT/scripts/ops/lib/common.sh"
export TAG
export GHCR_NAMESPACE
export MIO_API_IMAGE="ghcr.io/$GHCR_NAMESPACE/mio-api:$TAG"
export MIO_WEB_IMAGE="ghcr.io/$GHCR_NAMESPACE/mio-web:$TAG"

log "Baixando imagens para o commit $TAG."
compose pull
compose --parallel 1 up --no-build -d --wait --wait-timeout 180
compose ps

# Persist only the deployed image version. Application secrets stay in their
# existing apps/api/.env and apps/web/.env files.
env_file="$REPO_ROOT/.env"
tmp_file="$(mktemp "$REPO_ROOT/.env.XXXXXX")"
trap 'rm -f "$tmp_file"' EXIT
if [[ -f "$env_file" ]]; then
  awk '$0 !~ /^(TAG|GHCR_NAMESPACE)=/' "$env_file" > "$tmp_file"
fi
printf 'TAG=%s\n' "$TAG" >> "$tmp_file"
printf 'GHCR_NAMESPACE=%s\n' "$GHCR_NAMESPACE" >> "$tmp_file"
chmod 600 "$tmp_file"
mv "$tmp_file" "$env_file"
trap - EXIT

log "Deploy concluído. TAG=$TAG registrada para os scripts operacionais."
