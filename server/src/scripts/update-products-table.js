import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const POSTGRES_URL = process.env.POSTGRES_URL || process.env.NEON_DB_URL || process.env.DATABASE_URL;
const sequelize = new Sequelize(POSTGRES_URL, {
  dialect: 'postgres',
  logging: console.log, // Habilitar logs para debug
  dialectOptions: { ssl: { require: true, rejectUnauthorized: false } }
});

async function updateProductsTable() {
  const transaction = await sequelize.transaction();
  
  try {
    // 1. Verificar se a coluna status existe
    const [statusColumn] = await sequelize.query(
      `SELECT column_name 
       FROM information_schema.columns 
       WHERE table_name = 'products' AND column_name = 'status'`,
      { transaction }
    );

    // 2. Adicionar a coluna status se não existir
    if (statusColumn.length === 0) {
      console.log('Adicionando coluna status à tabela products...');
      await sequelize.query(
        `ALTER TABLE products ADD COLUMN status VARCHAR(20) DEFAULT 'active'`,
        { transaction }
      );
      console.log('Coluna status adicionada com sucesso!');
    } else {
      console.log('A coluna status já existe na tabela products.');
    }

    // 3. Atualizar o status para 'active' se for NULL
    await sequelize.query(
      `UPDATE products SET status = 'active' WHERE status IS NULL`,
      { transaction }
    );

    // 4. Commit da transação
    await transaction.commit();
    console.log('Tabela products atualizada com sucesso!');
  } catch (error) {
    // Rollback em caso de erro
    await transaction.rollback();
    console.error('Erro ao atualizar a tabela products:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

updateProductsTable().catch(e => {
  console.error('Erro ao executar o script:', e);
  process.exit(1);
});
