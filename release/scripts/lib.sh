#!/usr/bin/env bash
# Shared helpers for release and production operations.
set -euo pipefail

RELEASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPO_ROOT="$(cd "$RELEASE_DIR/.." && pwd)"
PRODUCTION_DIR="$RELEASE_DIR/environments/production"
API_ENV_FILE="$REPO_ROOT/apps/api/.env"
WEB_ENV_FILE="$REPO_ROOT/apps/web/.env"
DEPLOY_ENV_FILE="$REPO_ROOT/.env"
STATE_DIR="$RELEASE_DIR/.state"
STATE_FILE="$STATE_DIR/production.state"

load_env() {
  local state_source="$STATE_FILE"
  # Accept the previous state location during the first release after this layout change.
  [[ -f "$state_source" ]] || state_source="$DEPLOY_ENV_FILE"
  if [[ ! -f "$state_source" ]]; then
    echo "ERRO: estado do deploy não encontrado em $STATE_FILE." >&2
    echo "Execute um deploy para registrar TAG e GHCR_NAMESPACE." >&2
    exit 1
  fi
  set -a
  # shellcheck disable=SC1090
  source "$state_source"
  set +a
  if [[ ! "${TAG:-}" =~ ^[0-9a-f]{40}$ ]]; then
    echo "ERRO: TAG deve conter o SHA completo de 40 caracteres." >&2
    exit 1
  fi
  if [[ ! "${GHCR_NAMESPACE:-}" =~ ^[a-z0-9][a-z0-9-]*$ ]]; then
    echo "ERRO: GHCR_NAMESPACE ausente ou inválido em $state_source." >&2
    exit 1
  fi
  export MIO_API_IMAGE="ghcr.io/$GHCR_NAMESPACE/mio-api:$TAG"
  export MIO_API_MIGRATOR_IMAGE="ghcr.io/$GHCR_NAMESPACE/mio-api:$TAG-migrator"
  export MIO_WEB_IMAGE="ghcr.io/$GHCR_NAMESPACE/mio-web:$TAG"
}

compose() {
  local args=(--project-name mio --file "$PRODUCTION_DIR/docker-compose.yml")
  [[ ! -f "$STATE_FILE" ]] || args+=(--env-file "$STATE_FILE")
  [[ ! -f "$DEPLOY_ENV_FILE" || -f "$STATE_FILE" ]] || args+=(--env-file "$DEPLOY_ENV_FILE")
  args+=(--env-file "$API_ENV_FILE" --env-file "$WEB_ENV_FILE")
  docker compose "${args[@]}" "$@"
}

migrate_compose() {
  local args=(--project-name mio --file "$PRODUCTION_DIR/docker-compose.migrate.yml")
  [[ ! -f "$STATE_FILE" ]] || args+=(--env-file "$STATE_FILE")
  [[ ! -f "$DEPLOY_ENV_FILE" || -f "$STATE_FILE" ]] || args+=(--env-file "$DEPLOY_ENV_FILE")
  args+=(--env-file "$API_ENV_FILE" --env-file "$WEB_ENV_FILE")
  docker compose "${args[@]}" "$@"
}

validate_runtime_envs() {
  local env_file
  for env_file in "$API_ENV_FILE" "$WEB_ENV_FILE"; do
    if [[ ! -f "$env_file" ]]; then
      echo "Arquivo obrigatório ausente: $env_file" >&2
      exit 1
    fi
    if grep -Eq '^[A-Z0-9_]+=.*CHANGE_ME' "$env_file"; then
      echo "Substitua todos os valores CHANGE_ME em $env_file antes do deploy." >&2
      exit 1
    fi
  done
  local api_secret web_secret
  api_secret="$(sed -n 's/^INTERNAL_API_SECRET=//p' "$API_ENV_FILE" | head -n 1)"
  web_secret="$(sed -n 's/^INTERNAL_API_SECRET=//p' "$WEB_ENV_FILE" | head -n 1)"
  if [[ -z "$api_secret" || "$api_secret" != "$web_secret" ]]; then
    echo "INTERNAL_API_SECRET precisa ser não vazio e igual nos dois arquivos .env." >&2
    exit 1
  fi
}

confirm() {
  local message="$1" reply
  read -r -p "$message Digite 'sim' para continuar: " reply
  [[ "$reply" == "sim" ]] || { echo "Abortado."; exit 1; }
}

log() {
  echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] $*"
}
