#!/usr/bin/env bash
# Applies pending Prisma migrations using the API image currently deployed.
set -euo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib/common.sh"

load_env
log "Aplicando migrations com $MIO_API_IMAGE"
compose run --rm api-migrate
log "Migrations concluídas."
