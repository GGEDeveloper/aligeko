@echo off
rem ================================================
rem Script de Importação XML Interativo (Enhanced)
rem ================================================

echo Iniciando o importador XML interativo melhorado...
echo.

rem Navegar para o diretório do script
cd %~dp0

rem Verificar se Node.js está instalado
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERRO] Node.js não encontrado! Por favor, instale Node.js.
    echo Acesse: https://nodejs.org/en/download/
    pause
    exit /b 1
)

rem Criar diretório de backups se não existir
if not exist backups mkdir backups

echo Executando o script de importação...
echo [Para sair a qualquer momento, pressione Ctrl+C]
echo.

rem Executar o script Node.js
node xml-import-interactive.js

echo.
if %ERRORLEVEL% neq 0 (
    echo [ERRO] O script encontrou problemas durante a execução.
    echo Verifique as mensagens acima para mais detalhes.
) else (
    echo [SUCESSO] O script foi executado com sucesso!
)

pause 