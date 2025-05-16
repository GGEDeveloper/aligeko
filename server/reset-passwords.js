import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { Sequelize } from 'sequelize';

dotenv.config();

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.POSTGRES_HOST,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  logging: console.log
});

async function resetPasswords() {
  try {
    await sequelize.authenticate();
    console.log('Conexão com o banco de dados estabelecida com sucesso.');
    
    const password = await bcrypt.hash('senha123', 10);
    const [updated] = await sequelize.query(
      'UPDATE users SET password = :password RETURNING id, email',
      {
        replacements: { password },
        type: sequelize.QueryTypes.UPDATE
      }
    );
    
    console.log('Senhas redefinidas com sucesso para os seguintes usuários:');
    console.table(updated);
    console.log('Nova senha para todos os usuários: senha123');
    
  } catch (error) {
    console.error('Erro ao redefinir senhas:', error);
  } finally {
    await sequelize.close();
  }
}

resetPasswords();
