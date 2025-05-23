// Importações básicas
const express = require('express');
const cors = require('cors');
const { Sequelize } = require('sequelize');

// Configurar Express
const app = express();
app.use(cors());
app.use(express.json());

// Configurar banco de dados
const sequelize = new Sequelize(process.env.NEON_DB_URL || 'postgres://user:password@localhost:5432/alitools', {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: process.env.NODE_ENV === 'production',
      rejectUnauthorized: false
    }
  },
  logging: false
});

// Rota de verificação de saúde
app.get('/api/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.status(200).json({ status: 'ok', message: 'API funcionando e conectada ao banco de dados' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Erro ao conectar ao banco de dados', error: error.message });
  }
});

// Rota de API principal
app.get('/api', (req, res) => {
  res.json({ 
    message: 'API AliTools B2B', 
    version: '1.0.0',
    endpoints: [
      { path: '/api/health', description: 'Verifica a saúde da API e conexão com o banco de dados' }
    ]
  });
});

// Adicionar rota raiz para resolver o problema 401
app.get('/', (req, res) => {
  res.status(200).send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>AliTools API</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 800px;
          margin: 50px auto;
          padding: 20px;
          background-color: #f8f9fa;
          color: #333;
        }
        h1 {
          color: #FFCC00;
          border-bottom: 2px solid #1A1A1A;
          padding-bottom: 10px;
        }
        .card {
          background-color: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          margin-bottom: 20px;
        }
        .endpoint {
          background-color: #f1f1f1;
          padding: 10px;
          border-radius: 4px;
          margin-top: 8px;
          font-family: monospace;
        }
        .logo {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo img {
          max-width: 200px;
        }
      </style>
    </head>
    <body>
      <div class="logo">
        <img src="/client/dist/assets/logos/svg/logo.svg" alt="AliTools Logo" onerror="this.src='/client/dist/assets/logos/png/primary/logo_transparente.png'">
      </div>
      <h1>AliTools API</h1>
      <div class="card">
        <h2>Bem-vindo à API da AliTools</h2>
        <p>Esta é a API de backend para o e-commerce B2B da AliTools.</p>
        <p>Para acessar a documentação da API, visite:</p>
        <div class="endpoint">/api</div>
      </div>
      <div class="card">
        <h2>Verificar status da API:</h2>
        <div class="endpoint">/api/health</div>
      </div>
    </body>
    </html>
  `);
});

// Função serverless para Vercel
module.exports = (req, res) => {
  // Para fins de depuração
  console.log(`Requisição recebida: ${req.method} ${req.url}`);
  
  // Configurar o servidor Express para lidar com a requisição serverless
  return app(req, res);
};
