#!/bin/bash
# PostToolUse hook: biome (lint + format) + typecheck
# Runs on Edit/Write/MultiEdit tool completion

set -euo pipefail

INPUT=$(cat)

TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

if [[ "$TOOL_NAME" != "Edit" && "$TOOL_NAME" != "Write" && "$TOOL_NAME" != "MultiEdit" ]]; then
  exit 0
fi

if [[ -z "$FILE_PATH" || ! -f "$FILE_PATH" ]]; then
  exit 0
fi

EXT="${FILE_PATH##*.}"

PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$PROJECT_ROOT"

OUTPUT=""

# Biome: lint + format (ts, tsx, js, jsx, json, css)
BIOME_EXTS="ts tsx js jsx json css"
if [[ " $BIOME_EXTS " =~ " $EXT " ]]; then
  BIOME_BIN="${PROJECT_ROOT}/node_modules/.bin/biome"
  if [[ -f "$BIOME_BIN" ]]; then
    BIOME_OUT=$("$BIOME_BIN" check --fix "$FILE_PATH" 2>&1) || true
    if echo "$BIOME_OUT" | grep -qE "error|warning"; then
      OUTPUT="${OUTPUT}[biome] $BIOME_OUT\n"
    fi
  fi
fi

# TypeScript typecheck (report only)
TYPECHECK_EXTS="ts tsx"
if [[ " $TYPECHECK_EXTS " =~ " $EXT " ]]; then
  if [[ -f "${PROJECT_ROOT}/tsconfig.json" ]]; then
    TSC_BIN="${PROJECT_ROOT}/node_modules/.bin/tsc"
    if [[ -f "$TSC_BIN" ]]; then
      REL_PATH="${FILE_PATH#$PROJECT_ROOT/}"
      TSC_OUT=$("$TSC_BIN" --noEmit --pretty false 2>&1 | grep -E "^${REL_PATH//\//\\/}" || true)
      if [[ -n "$TSC_OUT" ]]; then
        OUTPUT="${OUTPUT}[typecheck] $TSC_OUT\n"
      fi
    fi
  fi
fi

if [[ -n "$OUTPUT" ]]; then
  echo -e "{\"hookSpecificOutput\":{\"hookEventName\":\"PostToolUse\",\"additionalContext\":\"$(echo -e "$OUTPUT" | sed 's/"/\\"/g' | tr '\n' ' ')\"}}"
fi

exit 0
