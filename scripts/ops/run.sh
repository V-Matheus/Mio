#!/usr/bin/env bash
# Runs any API package.json script in a one-off container using the deployed image.
set -euo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib/common.sh"

SCRIPT_NAME="${1:-}"
if [[ -z "$SCRIPT_NAME" ]]; then
  echo "Uso: $0 <nome-do-script-no-package.json> [argumentos...]" >&2
  exit 1
fi
shift

load_env
log "Executando yarn ${SCRIPT_NAME} ${*:-} na imagem $MIO_API_IMAGE."
compose --profile ops run --rm api-ops yarn "$SCRIPT_NAME" "$@"
