@echo off
echo ===========================
echo Script de Importacao XML Corrigido
echo ===========================

rem Carregar as variaveis de ambiente do .env
for /f "tokens=*" %%a in (..\..\.env) do (
  set %%a
)

rem Verificar se o arquivo e parametros foram fornecidos
if "%1"=="" (
  rem Modo interativo
  node xml-import-fixed.js
) else (
  rem Modo com parametros
  node xml-import-fixed.js %*
)

echo.
echo Script finalizado!
pause 