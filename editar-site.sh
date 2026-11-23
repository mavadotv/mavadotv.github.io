#!/usr/bin/env sh
# Abre o editor do site (macOS / Linux). Uso: sh editar-site.sh
cd "$(dirname "$0")" || exit 1
if ! command -v node >/dev/null 2>&1; then
  echo "O Node.js não está instalado. Baixe a versão LTS em https://nodejs.org"
  exit 1
fi
node editor/server.mjs --open
