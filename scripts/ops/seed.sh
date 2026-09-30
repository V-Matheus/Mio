#!/usr/bin/env bash
# Runs one API seed script against the VM's private Docker network.
set -euo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib/common.sh"

SCRIPT_NAME="${1:-}"
if [[ -z "$SCRIPT_NAME" ]]; then
  echo "Uso: $0 <nome-do-script-no-package.json>" >&2
  echo "Exemplo: $0 seed:all" >&2
  exit 1
fi
shift

load_env
confirm "Isso executará '${SCRIPT_NAME}' usando $MIO_API_IMAGE."
log "Executando yarn ${SCRIPT_NAME} na imagem implantada."
compose --profile ops run --rm api-ops yarn "$SCRIPT_NAME" "$@"
log "Script concluído."
