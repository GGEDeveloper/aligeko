import dotenv from 'dotenv';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import sequelize from '../config/database';

// Carregar variáveis de ambiente
dotenv.config();

// Obter o caminho atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const migrationsPath = resolve(__dirname, '../migrations');

// Função para executar a migração
async function executeMigration() {
  try {
    // Verificar conexão com o banco de dados
    await sequelize.authenticate();
    console.log('Conexão com o banco de dados estabelecida.');

    // Executar a migração
    console.log('Aplicando migração de 2FA...');
    execSync(`npx sequelize-cli db:migrate --migrations-path=${migrationsPath}`, { stdio: 'inherit' });
    
    console.log('Migração concluída com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao executar migração:', error);
    process.exit(1);
  }
}

// Executar a função
executeMigration(); 