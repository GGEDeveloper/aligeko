import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { rateLimit } from 'express-rate-limit';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import sequelize from './config/database';
import app from './app';

// Load environment variables
dotenv.config();

// Initialize express app
const PORT = process.env.PORT || 5000;

// Middleware
const app = express();
app.use(helmet()); // Security headers
app.use(compression()); // Compress responses
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(morgan('dev')); // Logging

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// API routes
app.use('/api', routes);

// Error handling middleware
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Verificar conexão com o banco de dados
    await sequelize.authenticate();
    console.log('Conexão com o banco de dados estabelecida com sucesso.');
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.error('Falha ao iniciar o servidor:', error);
    process.exit(1);
  }
};

// Executar servidor apenas se este arquivo for executado diretamente
if (require.main === module) {
  startServer();
}

export default app; 