#!/usr/bin/env bash
# Production release: validate, pull, start databases, migrate, then update apps.
set -euo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib.sh"

ENVIRONMENT="${1:-}"
TAG="${2:-}"
GHCR_NAMESPACE="${3:-}"
if [[ "$ENVIRONMENT" != "production" ]]; then
  echo "Uso: $0 production <SHA completo de 40 caracteres> <namespace GHCR em minúsculas>" >&2
  exit 1
fi
if [[ ! "$TAG" =~ ^[0-9a-f]{40}$ ]]; then
  echo "TAG deve conter o SHA completo de 40 caracteres." >&2
  exit 1
fi
if [[ ! "$GHCR_NAMESPACE" =~ ^[a-z0-9][a-z0-9-]*$ ]]; then
  echo "Namespace GHCR ausente ou inválido." >&2
  exit 1
fi

validate_runtime_envs
export TAG GHCR_NAMESPACE
export MIO_API_IMAGE="ghcr.io/$GHCR_NAMESPACE/mio-api:$TAG"
export MIO_API_MIGRATOR_IMAGE="ghcr.io/$GHCR_NAMESPACE/mio-api:$TAG-migrator"
export MIO_WEB_IMAGE="ghcr.io/$GHCR_NAMESPACE/mio-web:$TAG"

release_marker="ghcr.io/$GHCR_NAMESPACE/mio-api:ready-$TAG"
log "Validando que o conjunto de imagens $TAG está pronto."
docker pull "$release_marker" >/dev/null
docker pull "$MIO_API_MIGRATOR_IMAGE"

compose config --quiet
migrate_compose config --quiet
log "Baixando imagens de runtime para $TAG."
compose pull

log "Iniciando os bancos e aguardando os healthchecks."
compose up -d --wait --wait-timeout 180 postgres-core postgres-gamification postgres-achievements

log "Aplicando migrations com $MIO_API_MIGRATOR_IMAGE."
migrate_compose run --pull always --rm api-migrate

log "Atualizando serviços da aplicação."
compose --parallel 1 up --no-build -d --wait --wait-timeout 180 --remove-orphans
compose ps

mkdir -p "$STATE_DIR"
tmp_file="$(mktemp "$STATE_DIR/.production.state.XXXXXX")"
trap 'rm -f "$tmp_file"' EXIT
printf 'TAG=%s\nGHCR_NAMESPACE=%s\n' "$TAG" "$GHCR_NAMESPACE" >> "$tmp_file"
chmod 600 "$tmp_file"
mv "$tmp_file" "$STATE_FILE"
trap - EXIT
log "Release production concluída. TAG=$TAG registrada."
