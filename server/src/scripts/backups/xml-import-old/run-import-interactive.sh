#!/bin/bash
#=================================================
# Script de Importação XML Interativo (Enhanced)
#=================================================

echo "Iniciando o importador XML interativo melhorado..."
echo ""

# Navegar para o diretório do script
cd "$(dirname "$0")"

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "[ERRO] Node.js não encontrado! Por favor, instale Node.js."
    echo "Acesse: https://nodejs.org/en/download/"
    read -p "Pressione qualquer tecla para sair..."
    exit 1
fi

# Criar diretório de backups se não existir
if [ ! -d "backups" ]; then
    mkdir -p backups
fi

echo "Executando o script de importação..."
echo "[Para sair a qualquer momento, pressione Ctrl+C]"
echo ""

# Executar o script Node.js
node xml-import-interactive.js

echo ""
if [ $? -ne 0 ]; then
    echo "[ERRO] O script encontrou problemas durante a execução."
    echo "Verifique as mensagens acima para mais detalhes."
else
    echo "[SUCESSO] O script foi executado com sucesso!"
fi

read -p "Pressione qualquer tecla para sair..." 