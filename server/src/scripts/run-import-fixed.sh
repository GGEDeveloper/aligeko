#!/bin/bash

echo "==========================="
echo "Script de Importacao XML Corrigido"
echo "==========================="

# Carregar as variáveis de ambiente do .env
if [ -f "../../../.env" ]; then
  export $(grep -v '^#' ../../../.env | xargs)
fi

# Verificar se o arquivo e parâmetros foram fornecidos
if [ $# -eq 0 ]; then
  # Modo interativo
  node xml-import-fixed.js
else
  # Modo com parâmetros
  node xml-import-fixed.js "$@"
fi

echo ""
echo "Script finalizado!"
read -p "Pressione Enter para sair..." 