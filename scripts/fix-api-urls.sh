#!/bin/bash

# Script para corrigir URLs da API hardcoded em arquivos JavaScript/JSX
# Data: 2023-06-08

echo "===== AliTools B2B API URL Fix ====="
echo "Data: $(date)"
echo ""
echo "Este script irá procurar e substituir URLs hardcoded da API por caminhos relativos."
echo ""

# Diretório principal do cliente
CLIENT_DIR="client/src"

# Arquivos de API para atualizar
API_FILES=(
  "${CLIENT_DIR}/store/api/productApi.js"
  "${CLIENT_DIR}/store/api/orderApi.js"
  "${CLIENT_DIR}/store/api/customerApi.js"
  "${CLIENT_DIR}/store/api/categoryApi.js"
  "${CLIENT_DIR}/store/api/reportApi.js"
  "${CLIENT_DIR}/store/api/attributeApi.js"
)

# Contador de arquivos atualizados
UPDATED_COUNT=0

echo "Atualizando arquivos API principais..."
for file in "${API_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Processando $file..."
    
    # Substitui 'http://localhost:5000/v1' por '/api/v1'
    # Windows (PowerShell): Vamos criar arquivos temporários
    TEMP_FILE="${file}.tmp"
    cat "$file" | sed 's|const API_URL = process.env.REACT_APP_API_URL || '\''http://localhost:5000/v1'\''|const API_URL = '\''/api/v1'\''|g' > "$TEMP_FILE"
    
    # Verificar se houve alterações
    if ! cmp -s "$file" "$TEMP_FILE"; then
      mv "$TEMP_FILE" "$file"
      echo "✓ Atualizado: $file"
      UPDATED_COUNT=$((UPDATED_COUNT+1))
    else
      rm "$TEMP_FILE"
      echo "- Sem alterações: $file"
    fi
  else
    echo "⚠️ Arquivo não encontrado: $file"
  fi
done

# Procurar por outros arquivos com a URL hardcoded
echo ""
echo "Procurando por outras ocorrências de 'http://localhost:5000/v1'..."
OTHER_FILES=$(grep -r "http://localhost:5000/v1" --include="*.js" --include="*.jsx" $CLIENT_DIR | grep -v "\/store\/api\/" | cut -d: -f1 | sort | uniq)

if [ -n "$OTHER_FILES" ]; then
  echo "Encontradas ocorrências em outros arquivos:"
  echo "$OTHER_FILES" | while read -r file; do
    echo "- $file"
  done
  
  echo ""
  echo "⚠️ Atenção: Os arquivos acima precisam ser revisados manualmente."
  echo "   Verifique o contexto em que a URL está sendo usada antes de substituir."
else
  echo "Nenhuma outra ocorrência encontrada."
fi

echo ""
echo "===== Resumo ====="
echo "Total de arquivos atualizados: $UPDATED_COUNT"
echo ""
echo "Próximos passos:"
echo "1. Execute 'cd client && npm run build' para reconstruir o cliente"
echo "2. Faça commit das alterações: git add . && git commit -m 'fix: Replace hardcoded API URLs with relative paths'"
echo "3. Faça deploy para o Vercel: vercel --prod"
echo ""
echo "Para reverter as alterações em caso de problemas: git reset --hard HEAD~1" 