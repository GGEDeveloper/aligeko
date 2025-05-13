/**
 * Restore Database Backup Script
 * 
 * Este script restaura um backup do banco de dados criado durante
 * o processo de importação XML da GEKO.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
import colors from 'colors';

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from absolute path
const envPath = path.resolve(__dirname, '../../../.env');
console.log(`Carregando variáveis de ambiente de: ${envPath}`);
dotenv.config({ path: envPath });

// Configure colors
colors.setTheme({
  info: 'blue',
  warn: 'yellow',
  error: 'red',
  success: 'green',
  data: 'grey',
  highlight: 'cyan',
  bold: 'bold'
});

/**
 * Função principal para restaurar o backup
 */
async function restoreBackup() {
  console.log('='.repeat(80).bold);
  console.log('RESTAURAÇÃO DE BACKUP DO BANCO DE DADOS'.bold);
  console.log('='.repeat(80).bold);
  
  try {
    // Verificar argumentos da linha de comando
    const backupPath = process.argv[2];
    if (!backupPath) {
      console.error('\n❌ ERRO: Caminho do backup não especificado'.error);
      console.log('\nUso: node restore-backup.js <caminho-do-arquivo-backup>'.info);
      process.exit(1);
    }
    
    // Verificar se o arquivo de backup existe
    if (!fs.existsSync(backupPath)) {
      console.error(`\n❌ ERRO: Arquivo de backup não encontrado: ${backupPath}`.error);
      process.exit(1);
    }
    
    // Obter informações do arquivo
    const stats = fs.statSync(backupPath);
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`\n📂 Arquivo de backup: ${backupPath}`.info);
    console.log(`📊 Tamanho: ${fileSizeMB} MB`.info);
    console.log(`📅 Data de criação: ${stats.mtime}`.info);
    
    // Ler conteúdo do backup
    console.log('\n🔍 Lendo arquivo de backup...'.info);
    const backupData = fs.readFileSync(backupPath, 'utf8');
    
    try {
      // Analisar o conteúdo JSON
      const backup = JSON.parse(backupData);
      console.log('\n✅ Arquivo de backup válido!'.success);
      console.log(`\n📋 Informações do backup:`.info);
      console.log(`   Data de criação: ${new Date(backup.timestamp).toLocaleString()}`.data);
      console.log(`   Versão: ${backup.version}`.data);
      console.log(`   Entidades incluídas: ${Object.keys(backup.data).join(', ')}`.data);
      
      // Exibir contagens
      console.log('\n📊 Contagens de entidades:'.info);
      Object.entries(backup.data).forEach(([entity, data]) => {
        console.log(`   ${entity}: ${data.length} registros`.data);
      });
      
      // Confirmar restauração
      console.log('\n⚠️ ATENÇÃO: Esta operação irá substituir dados no banco de dados'.warn.bold);
      console.log('A restauração irá deletar os dados atuais e restaurar o backup.'.warn);
      console.log('Este processo NÃO PODE ser desfeito. Certifique-se de ter outro backup se necessário.'.warn);
      
      // Como estamos em um script executado automaticamente, prosseguir sem confirmação interativa
      
      // Conectar ao banco de dados
      console.log('\n🔌 Conectando ao banco de dados...'.info);
      const sequelize = await connectToDatabase();
      console.log('✅ Conexão estabelecida com sucesso!'.success);
      
      // Iniciar transação
      console.log('\n🔄 Iniciando transação de restauração...'.info);
      const transaction = await sequelize.transaction();
      
      try {
        // Restaurar cada entidade
        console.log('\n🔄 Restaurando dados...'.info);
        
        // Ordem de restauração (inversa da dependência)
        const restoreOrder = [
          'product_properties', 
          'documents', 
          'images', 
          'prices', 
          'stocks', 
          'variants',
          'products', 
          'producers', 
          'categories', 
          'units'
        ];
        
        // Primeiro limpar as tabelas (ordem inversa de restauração)
        console.log('\n🗑️ Limpando tabelas existentes...'.info);
        for (const entity of [...restoreOrder].reverse()) {
          if (backup.data[entity]) {
            console.log(`   Limpando tabela ${entity}...`.data);
            await sequelize.query(`DELETE FROM ${entity}`, { transaction });
          }
        }
        
        // Restaurar dados
        console.log('\n📥 Inserindo dados do backup...'.info);
        for (const entity of restoreOrder) {
          if (backup.data[entity] && backup.data[entity].length > 0) {
            console.log(`   Restaurando ${backup.data[entity].length} registros em ${entity}...`.data);
            
            // Restauração por lotes para melhor performance
            const batchSize = 500;
            for (let i = 0; i < backup.data[entity].length; i += batchSize) {
              const batch = backup.data[entity].slice(i, i + batchSize);
              
              // Usar INSERT com queryInterface para preservar IDs originais
              const placeholders = batch.map((_, idx) => 
                `(${Object.keys(batch[idx]).map(() => '?').join(', ')})`
              ).join(', ');
              
              const columns = Object.keys(batch[0]).join(', ');
              const values = batch.flatMap(item => Object.values(item));
              
              const query = `INSERT INTO ${entity} (${columns}) VALUES ${placeholders}`;
              await sequelize.query(query, {
                replacements: values,
                type: sequelize.QueryTypes.INSERT,
                transaction
              });
            }
          }
        }
        
        // Confirmar a transação
        console.log('\n✅ Restauração concluída, confirmando transação...'.success);
        await transaction.commit();
        console.log('\n🎉 RESTAURAÇÃO CONCLUÍDA COM SUCESSO!'.success.bold);
        
        // Fechar conexão
        await sequelize.close();
        
      } catch (error) {
        // Em caso de erro, reverter a transação
        if (transaction) await transaction.rollback();
        throw error;
      }
      
    } catch (error) {
      console.error(`\n❌ ERRO AO PROCESSAR BACKUP: ${error.message}`.error);
      console.error(error.stack);
      process.exit(1);
    }
    
  } catch (error) {
    console.error(`\n❌ ERRO: ${error.message}`.error);
    console.error(error.stack);
    process.exit(1);
  }
}

/**
 * Função para conectar ao banco de dados
 */
async function connectToDatabase() {
  // Create direct connection to database using NEON_DB_URL
  if (process.env.NEON_DB_URL) {
    const sequelize = new Sequelize(process.env.NEON_DB_URL, {
      dialect: 'postgres',
      logging: false,
      ssl: true,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      },
      pool: {
        max: 10,
        min: 0,
        idle: 20000,
        acquire: 120000
      }
    });
    
    // Testar conexão
    await sequelize.authenticate();
    return sequelize;
  } else {
    throw new Error('Variável de ambiente NEON_DB_URL não está definida');
  }
}

// Executar função principal
restoreBackup(); 