#!/usr/bin/env bash
# Shared helpers for operational commands executed against the VM Compose stack.
set -euo pipefail

OPS_LIB_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OPS_DIR="$(cd "$OPS_LIB_DIR/.." && pwd)"
REPO_ROOT="$(cd "$OPS_DIR/../.." && pwd)"

load_env() {
  local env_file="$REPO_ROOT/.env"
  if [[ ! -f "$env_file" ]]; then
    echo "ERRO: arquivo de deploy não encontrado: $env_file" >&2
    echo "Execute o deploy do commit desejado para registrar a variável TAG." >&2
    exit 1
  fi

  set -a
  # shellcheck disable=SC1090
  source "$env_file"
  set +a

  if [[ ! "${TAG:-}" =~ ^[0-9a-f]{40}$ ]]; then
    echo "ERRO: TAG deve conter o SHA completo de 40 caracteres da imagem implantada." >&2
    exit 1
  fi
  if [[ ! "${GHCR_NAMESPACE:-}" =~ ^[a-z0-9][a-z0-9-]*$ ]]; then
    echo "ERRO: GHCR_NAMESPACE ausente ou inválido no $env_file." >&2
    echo "Execute o deploy para registrar o namespace do registry." >&2
    exit 1
  fi

  export MIO_API_IMAGE="ghcr.io/$GHCR_NAMESPACE/mio-api:$TAG"
  export MIO_WEB_IMAGE="ghcr.io/$GHCR_NAMESPACE/mio-web:$TAG"
}

compose() {
  docker compose \
    --env-file "$REPO_ROOT/apps/api/.env" \
    --env-file "$REPO_ROOT/apps/web/.env" \
    "$@"
}

confirm() {
  local message="$1"
  local reply
  read -r -p "$message Digite 'sim' para continuar: " reply
  if [[ "$reply" != "sim" ]]; then
    echo "Abortado."
    exit 1
  fi
}

log() {
  echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] $*"
}
