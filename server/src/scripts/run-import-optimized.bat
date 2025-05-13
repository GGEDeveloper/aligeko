@echo off
echo ===================================
echo Importador XML Otimizado - Executor
echo ===================================

rem Navegar para o diretório do projeto
cd /d %~dp0..\..

rem Verificar se o Node.js está instalado
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
  echo ERRO: Node.js não encontrado! Por favor, instale o Node.js antes de executar este script.
  pause
  exit /b 1
)

rem Verificar se as variáveis de ambiente estão configuradas
if not exist .env (
  echo AVISO: Arquivo .env não encontrado. Criando um arquivo .env de exemplo...
  echo NODE_ENV=development > .env
  echo NEON_DB_URL=postgres://seu_usuario:sua_senha@seu_host:5432/seu_banco >> .env
  echo JWT_SECRET=seu_jwt_secret >> .env
  echo PORT=5000 >> .env
  echo.
  echo ATENÇÃO: Edite o arquivo .env com suas credenciais de banco de dados!
  pause
)

echo.
echo Iniciando o script de importação XML otimizado...
echo.

rem Executar o script
node src/scripts/xml-import-optimized.js %*

if %ERRORLEVEL% neq 0 (
  echo.
  echo ERRO: O script de importação encontrou um problema!
  echo Verifique os logs acima para mais detalhes.
) else (
  echo.
  echo Script executado com sucesso!
)

echo.
pause 