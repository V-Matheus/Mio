#!/bin/bash
# Script para configurar links simbólicos locais para IAs

set -euo pipefail

# Define a raiz do projeto
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

AVAILABLE_IAS=("Claude Code (.claude/ & CLAUDE.md)" "Google Antigravity (.agents/rules/)" "Cursor (.cursor/rules/)" "GitHub Copilot (.github/copilot-instructions.md)")
n=${#AVAILABLE_IAS[@]}

# Estado inicial: Claude (1) e Antigravity (1) ON por padrão, outros OFF (0)
state=(1 1 0 0)

while true; do
  echo
  echo "=== Configuração de IA local - selecione as opções ==="
  echo "Digite o número para alternar o serviço (ex: 3), Enter sem digitar nada para confirmar:"
  for ((i = 0; i < n; i++)); do
    box="[ ]"; [ "${state[i]}" -eq 1 ] && box="[x]"
    printf '  %2d) %s %s\n' "$((i + 1))" "$box" "${AVAILABLE_IAS[i]}"
  done
  printf '   a) todos   z) nenhum\n'
  read -r -p "> " input || break
  [ -z "$input" ] && break
  case "$input" in
    a|A) for ((i = 0; i < n; i++)); do state[i]=1; done ;;
    z|Z) for ((i = 0; i < n; i++)); do state[i]=0; done ;;
    *[!0-9]*) echo "  Entrada inválida" ;;
    *) if [ "$input" -ge 1 ] && [ "$input" -le "$n" ]; then
         i=$((input - 1)); state[i]=$((1 - state[i]))
       else echo "  Opção fora do intervalo"; fi ;;
  esac
done

CONFIGURE_CLAUDE=false
CONFIGURE_ANTIGRAVITY=false
CONFIGURE_CURSOR=false
CONFIGURE_COPILOT=false

[ "${state[0]}" -eq 1 ] && CONFIGURE_CLAUDE=true
[ "${state[1]}" -eq 1 ] && CONFIGURE_ANTIGRAVITY=true
[ "${state[2]}" -eq 1 ] && CONFIGURE_CURSOR=true
[ "${state[3]}" -eq 1 ] && CONFIGURE_COPILOT=true

# Se nenhuma IA foi selecionada
if [ "$CONFIGURE_CLAUDE" = false ] && [ "$CONFIGURE_ANTIGRAVITY" = false ] && [ "$CONFIGURE_CURSOR" = false ] && [ "$CONFIGURE_COPILOT" = false ]; then
  echo "Nenhuma IA selecionada. Abortando configuração local."
  exit 0
fi

# 1. Configurar Claude Code
if [ "$CONFIGURE_CLAUDE" = true ]; then
  echo "Configurando Claude Code..."
  rm -rf .claude CLAUDE.md
  ln -sf .ai .claude
  ln -sf .ai/apps/monorepo.md CLAUDE.md
  
  # Configurações específicas nos sub-apps
  rm -rf apps/api/CLAUDE.md apps/web/CLAUDE.md
  ln -sf ../../.ai/apps/api.md apps/api/CLAUDE.md
  ln -sf ../../.ai/apps/web.md apps/web/CLAUDE.md
fi

# 2. Configurar Antigravity
if [ "$CONFIGURE_ANTIGRAVITY" = true ]; then
  echo "Configurando Google Antigravity..."
  mkdir -p .agents
  rm -rf .agents/rules .agents/hooks.json .agents/skills
  ln -sf ../.ai/rules .agents/rules
  ln -sf ../.ai/settings.json .agents/hooks.json
  ln -sf ../.ai/skills .agents/skills
  
  # Adiciona as regras dos sub-apps no Antigravity
  ln -sf ../../.ai/apps/api.md .agents/rules/api-rules.md
  ln -sf ../../.ai/apps/web.md .agents/rules/web-rules.md
fi

# 3. Configurar Cursor
if [ "$CONFIGURE_CURSOR" = true ]; then
  echo "Configurando Cursor..."
  mkdir -p .cursor/rules
  rm -f .cursor/rules/*.mdc
  ln -sf ../../.ai/rules/general-rules.md .cursor/rules/general-rules.mdc
  ln -sf ../../.ai/rules/code-modification-policy.md .cursor/rules/code-modification-policy.mdc
  ln -sf ../../.ai/agents/design-to-react.md .cursor/rules/design-to-react.mdc
  ln -sf ../../.ai/apps/api.md .cursor/rules/api-rules.mdc
  ln -sf ../../.ai/apps/web.md .cursor/rules/web-rules.mdc
fi

# 4. Configurar GitHub Copilot
if [ "$CONFIGURE_COPILOT" = true ]; then
  echo "Configurando GitHub Copilot..."
  mkdir -p .github
  rm -f .github/copilot-instructions.md
  ln -sf ../.ai/rules/general-rules.md .github/copilot-instructions.md
fi

echo "=== Configuração de IA concluída com sucesso! ==="
