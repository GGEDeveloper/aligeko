@echo off
echo ===================================================
echo IMPORTADOR DE XML PARA BANCO DE DADOS POSTGRESQL
echo ===================================================
echo.

REM Verificar se Node.js está instalado
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
  echo ERRO: Node.js não encontrado. Por favor, instale o Node.js e tente novamente.
  exit /b 1
)

echo Executando importador de XML...
echo.

REM Caminho do arquivo XML (por padrão usa o arquivo na raiz do projeto)
SET XML_FILE=%~1
if "%XML_FILE%"=="" (
  SET XML_FILE=..\..\..\..\produkty_xml_3_26-04-2025_12_51_02_en.xml
  echo Usando arquivo XML padrão: %XML_FILE%
) else (
  echo Usando arquivo XML especificado: %XML_FILE%
)

echo.
echo Iniciando importação...
echo.

REM Executar o script Node.js
node xml-import-simple.js "%XML_FILE%"

if %ERRORLEVEL% neq 0 (
  echo.
  echo ERRO: A importação falhou!
  exit /b 1
) else (
  echo.
  echo SUCESSO: Importação concluída com sucesso!
)

echo.
echo ===================================================
echo Concluído!
echo =================================================== 