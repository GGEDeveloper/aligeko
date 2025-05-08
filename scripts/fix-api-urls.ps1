# Script para corrigir URLs da API hardcoded em arquivos JavaScript/JSX
# Data: 2023-06-08

Write-Host "===== AliTools B2B API URL Fix =====" -ForegroundColor Cyan
Write-Host "Data: $(Get-Date)" -ForegroundColor Cyan
Write-Host ""
Write-Host "Este script irá procurar e substituir URLs hardcoded da API por caminhos relativos." -ForegroundColor Yellow
Write-Host ""

# Diretório principal do cliente
$CLIENT_DIR = "client/src"

# Arquivos de API para atualizar
$API_FILES = @(
  "$CLIENT_DIR/store/api/productApi.js",
  "$CLIENT_DIR/store/api/orderApi.js",
  "$CLIENT_DIR/store/api/customerApi.js", 
  "$CLIENT_DIR/store/api/categoryApi.js",
  "$CLIENT_DIR/store/api/reportApi.js",
  "$CLIENT_DIR/store/api/attributeApi.js"
)

# Contador de arquivos atualizados
$UPDATED_COUNT = 0

Write-Host "Atualizando arquivos API principais..." -ForegroundColor Green
foreach ($file in $API_FILES) {
  if (Test-Path $file) {
    Write-Host "Processando $file..."
    
    # Lê o conteúdo do arquivo
    $content = Get-Content -Path $file -Raw
    
    # Substitui 'http://localhost:5000/v1' por '/api/v1'
    $newContent = $content -replace "const API_URL = process\.env\.REACT_APP_API_URL \|\| 'http://localhost:5000/v1'", "const API_URL = '/api/v1'"
    
    # Verifica se houve alterações
    if ($content -ne $newContent) {
      # Salva o novo conteúdo
      Set-Content -Path $file -Value $newContent
      Write-Host "✓ Atualizado: $file" -ForegroundColor Green
      $UPDATED_COUNT++
    } else {
      Write-Host "- Sem alterações: $file" -ForegroundColor Gray
    }
  } else {
    Write-Host "Arquivo não encontrado: $file" -ForegroundColor Red
  }
}

# Procurar por outros arquivos com a URL hardcoded
Write-Host ""
Write-Host "Procurando por outras ocorrências de 'http://localhost:5000/v1'..." -ForegroundColor Yellow

# Função para buscar recursivamente
function Find-StringInFiles {
  param (
    [string]$Path,
    [string]$SearchString
  )
  
  Get-ChildItem -Path $Path -Recurse -Include "*.js","*.jsx" | 
    Select-String -Pattern $SearchString | 
    ForEach-Object { $_.Path } | 
    Where-Object { $_ -notlike "*\store\api\*" } |
    Select-Object -Unique
}

$OTHER_FILES = Find-StringInFiles -Path $CLIENT_DIR -SearchString "http://localhost:5000/v1"

if ($OTHER_FILES) {
  Write-Host "Encontradas ocorrências em outros arquivos:" -ForegroundColor Yellow
  foreach ($file in $OTHER_FILES) {
    Write-Host "- $file" -ForegroundColor Yellow
  }
  
  Write-Host ""
  Write-Host "Atenção: Os arquivos acima precisam ser revisados manualmente." -ForegroundColor Red
  Write-Host "   Verifique o contexto em que a URL está sendo usada antes de substituir." -ForegroundColor Red
} else {
  Write-Host "Nenhuma outra ocorrência encontrada." -ForegroundColor Green
}

Write-Host ""
Write-Host "===== Resumo =====" -ForegroundColor Cyan
Write-Host "Total de arquivos atualizados: $UPDATED_COUNT" -ForegroundColor Cyan
Write-Host ""
Write-Host "Próximos passos:" -ForegroundColor Green
Write-Host "1. Execute 'cd client && npm run build' para reconstruir o cliente" -ForegroundColor Green
Write-Host "2. Faça commit das alterações: git add . ; git commit -m 'fix: Replace hardcoded API URLs with relative paths'" -ForegroundColor Green
Write-Host "3. Faça deploy para o Vercel: vercel --prod" -ForegroundColor Green
Write-Host ""
Write-Host "Para reverter as alterações em caso de problemas: git reset --hard HEAD~1" -ForegroundColor Yellow 