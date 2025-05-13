#!/bin/bash

echo "==================================================="
echo "IMPORTADOR DE XML PARA BANCO DE DADOS POSTGRESQL"
echo "==================================================="
echo

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
  echo "ERRO: Node.js não encontrado. Por favor, instale o Node.js e tente novamente."
  exit 1
fi

echo "Executando importador de XML..."
echo

# Caminho do arquivo XML (por padrão usa o arquivo na raiz do projeto)
XML_FILE=$1
if [ -z "$XML_FILE" ]; then
  XML_FILE="../../../../produkty_xml_3_26-04-2025_12_51_02_en.xml"
  echo "Usando arquivo XML padrão: $XML_FILE"
else
  echo "Usando arquivo XML especificado: $XML_FILE"
fi

echo
echo "Iniciando importação..."
echo

# Executar o script Node.js
node xml-import-simple.js "$XML_FILE"

if [ $? -ne 0 ]; then
  echo
  echo "ERRO: A importação falhou!"
  exit 1
else
  echo
  echo "SUCESSO: Importação concluída com sucesso!"
fi

echo
echo "==================================================="
echo "Concluído!"
echo "===================================================" 