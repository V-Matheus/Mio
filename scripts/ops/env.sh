#!/usr/bin/env bash
# Edits VM environment files and recreates only the selected application containers.
set -euo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib/common.sh"

TARGET="${1:-}"
case "$TARGET" in
  api|web|both) ;;
  *)
    echo "Uso: $0 <api|web|both>" >&2
    exit 1
    ;;
esac

load_env
if ! command -v nano >/dev/null 2>&1; then
  echo "nano não está instalado. Instale-o na VM ou ajuste o script para seu editor." >&2
  exit 1
fi
for env_file in "$REPO_ROOT/apps/api/.env" "$REPO_ROOT/apps/web/.env"; do
  if [[ ! -f "$env_file" ]]; then
    echo "Arquivo obrigatório ausente: $env_file" >&2
    exit 1
  fi
done

if [[ "$TARGET" == "api" || "$TARGET" == "both" ]]; then
  nano "$REPO_ROOT/apps/api/.env"
fi
if [[ "$TARGET" == "web" || "$TARGET" == "both" ]]; then
  nano "$REPO_ROOT/apps/web/.env"
fi

api_secret="$(sed -n 's/^INTERNAL_API_SECRET=//p' "$REPO_ROOT/apps/api/.env" | head -n 1)"
web_secret="$(sed -n 's/^INTERNAL_API_SECRET=//p' "$REPO_ROOT/apps/web/.env" | head -n 1)"
if [[ -z "$api_secret" || "$api_secret" != "$web_secret" ]]; then
  echo "ERRO: INTERNAL_API_SECRET precisa ser não vazio e igual nos dois arquivos .env." >&2
  echo "Os arquivos foram salvos; corrija os valores antes de reiniciar os containers." >&2
  exit 1
fi

compose config --quiet

api_services=(
  api-gateway
  api-core
  api-gamification
  api-achievements
  api-messenger
  api-notifications
)
web_services=(web)
case "$TARGET" in
  api) services=("${api_services[@]}") ;;
  web) services=("${web_services[@]}") ;;
  both) services=("${api_services[@]}" "${web_services[@]}") ;;
esac

log "Recriando os containers selecionados com as imagens da TAG=$TAG (sem baixar imagens)."
compose up --no-deps --force-recreate --no-build --pull never -d "${services[@]}"
compose ps "${services[@]}"
log "Configuração aplicada."
