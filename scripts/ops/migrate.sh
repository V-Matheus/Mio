#!/usr/bin/env bash
# Applies pending Prisma migrations using the dedicated migrator image.
set -euo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib/common.sh"

load_env
log "Aplicando migrations com $MIO_API_MIGRATOR_IMAGE"
migrate_compose run --pull always --rm api-migrate
log "Migrations concluídas."
