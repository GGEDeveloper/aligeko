#!/bin/bash

echo "==================================="
echo "Importador XML Otimizado - Executor"
echo "==================================="

# Navegar para o diretório raiz do projeto
cd "$(dirname "$0")/../.." || { echo "Falha ao navegar para o diretório do projeto."; exit 1; }

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
  echo "ERRO: Node.js não encontrado! Por favor, instale o Node.js antes de executar este script."
  exit 1
fi

# Verificar se as variáveis de ambiente estão configuradas
if [ ! -f .env ]; then
  echo "AVISO: Arquivo .env não encontrado. Criando um arquivo .env de exemplo..."
  cat > .env << EOL
NODE_ENV=development
NEON_DB_URL=postgres://seu_usuario:sua_senha@seu_host:5432/seu_banco
JWT_SECRET=seu_jwt_secret
PORT=5000
EOL
  echo
  echo "ATENÇÃO: Edite o arquivo .env com suas credenciais de banco de dados!"
  read -p "Pressione Enter para continuar..."
fi

echo
echo "Iniciando o script de importação XML otimizado..."
echo

# Executar o script
node src/scripts/xml-import-optimized.js "$@"

if [ $? -ne 0 ]; then
  echo
  echo "ERRO: O script de importação encontrou um problema!"
  echo "Verifique os logs acima para mais detalhes."
else
  echo
  echo "Script executado com sucesso!"
fi

echo
read -p "Pressione Enter para sair..." 