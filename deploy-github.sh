#!/usr/bin/env sh
set -eu

if [ "${1:-}" = "" ]; then
  echo "Uso: $0 <url-github> [branch-ou-tag] [porta]"
  echo "Exemplo: $0 https://github.com/usuario/projeto.git main 5540"
  exit 1
fi

GIT_REPO="$1"
GIT_REF="${2:-main}"
APP_PORT="${3:-5540}"

# Compose aceita contexto git remoto no formato URL#ref.
REMOTE_CONTEXT="${GIT_REPO}#${GIT_REF}"

echo "Subindo projeto remoto: ${REMOTE_CONTEXT}"
echo "Porta local: ${APP_PORT}"

GIT_REPO="${REMOTE_CONTEXT}" APP_PORT="${APP_PORT}" docker compose -f docker-compose.github.yml up --build -d

echo "Aplicacao publicada em: http://localhost:${APP_PORT}"
