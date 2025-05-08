// Simple Express server for SPA
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import cors from 'cors';
import helmet from 'helmet';

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Aplicar helmet para segurança
app.use(helmet({
  contentSecurityPolicy: false, // Desabilitar temporariamente para desenvolvimento
  crossOriginEmbedderPolicy: false
}));

// Configure CORS with a function to support dynamic origins
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin) return callback(null, true);
    
    // List of allowed origins
    const allowedOrigins = [
      'http://localhost:3000', 
      'https://alitools-b2b.vercel.app', 
      'https://aligekow-iwznrnlz0-alitools-projects.vercel.app'
    ];
    
    // Allow all Vercel preview deployment URLs
    if (
      allowedOrigins.includes(origin) || 
      origin.match(/https:\/\/aligekow-[a-z0-9]+-alitools-projects\.vercel\.app/)
    ) {
      return callback(null, true);
    }
    
    // Log blocked origins for debugging
    console.log(`CORS blocked origin: ${origin}`);
    return callback(new Error(`CORS policy does not allow access from origin ${origin}`), false);
  },
  credentials: true
}));

// Serve static files from the React app with explicit MIME types
app.use(express.static(join(__dirname, 'client/dist'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
    } else if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css; charset=UTF-8');
    } else if (path.endsWith('.html')) {
      res.setHeader('Content-Type', 'text/html; charset=UTF-8');
    }
    
    // Add cache headers for static assets
    if (path.includes('/assets/')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hour for other files
    }
  }
}));

// API endpoint mock para funcionar sem o servidor
app.get('/api/v1/products', (req, res) => {
  // Fornecer dados demo para produtos
  res.json({
    success: true,
    data: {
      totalItems: 12,
      items: [
        { id: 1, name: "Martelo Profissional", price: 49.99, category: "Ferramentas Manuais", imageUrl: "/assets/images/products/hammer.jpg" },
        { id: 2, name: "Alicate Universal", price: 29.99, category: "Ferramentas Manuais", imageUrl: "/assets/images/products/plier.jpg" },
        { id: 3, name: "Furadeira Elétrica", price: 129.99, category: "Ferramentas Elétricas", imageUrl: "/assets/images/products/drill.jpg" },
        { id: 4, name: "Chave de Fenda", price: 12.99, category: "Ferramentas Manuais", imageUrl: "/assets/images/products/screwdriver.jpg" },
        { id: 5, name: "Serra Circular", price: 199.99, category: "Ferramentas Elétricas", imageUrl: "/assets/images/products/saw.jpg" },
        { id: 6, name: "Nível a Laser", price: 89.99, category: "Medição", imageUrl: "/assets/images/products/level.jpg" },
        { id: 7, name: "Lixadeira Orbital", price: 159.99, category: "Ferramentas Elétricas", imageUrl: "/assets/images/products/sander.jpg" },
        { id: 8, name: "Conjunto de Chaves", price: 69.99, category: "Ferramentas Manuais", imageUrl: "/assets/images/products/wrench-set.jpg" },
        { id: 9, name: "Pistola de Solda", price: 139.99, category: "Soldagem", imageUrl: "/assets/images/products/solder.jpg" },
        { id: 10, name: "Compressor de Ar", price: 249.99, category: "Pneumática", imageUrl: "/assets/images/products/compressor.jpg" },
        { id: 11, name: "Escada de Alumínio", price: 179.99, category: "Acesso", imageUrl: "/assets/images/products/ladder.jpg" },
        { id: 12, name: "Kit de Segurança", price: 99.99, category: "EPI", imageUrl: "/assets/images/products/safety.jpg" }
      ],
      page: 1,
      limit: 12,
      totalPages: 1
    }
  });
});

// Rota para informações da empresa (mock)
app.get('/api/v1/company-info', (req, res) => {
  res.json({
    success: true,
    data: {
      name: "AliTools",
      description: "Fornecendo as melhores ferramentas e equipamentos para profissionais.",
      founded: "2010",
      mission: "Fornecer ferramentas de qualidade para profissionais que constroem um futuro melhor.",
      vision: "Ser o principal fornecedor de ferramentas B2B no mercado nacional.",
      values: [
        "Qualidade em tudo que fazemos",
        "Integridade nos negócios",
        "Respeito pelos clientes e parceiros",
        "Inovação constante"
      ],
      address: {
        street: "Av. Paulista, 1234",
        city: "São Paulo",
        state: "SP",
        zipCode: "01310-000",
        country: "Brasil"
      },
      contact: {
        phone: "+55 11 5555-5555",
        email: "contato@alitools.com.br",
        workingHours: "Segunda a Sexta, 8h às 18h"
      },
      socialMedia: {
        instagram: "https://instagram.com/alitools",
        facebook: "https://facebook.com/alitools",
        linkedin: "https://linkedin.com/company/alitools",
        youtube: "https://youtube.com/alitools"
      }
    }
  });
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'client/dist/index.html'));
});

const port = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

// Export for Vercel
export default app;
