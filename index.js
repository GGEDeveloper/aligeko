// Simple Express server for SPA
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import cors from 'cors';

// Get directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// CORS and basic middleware
app.use(cors());
app.use(express.json());

// Serve static files with explicit MIME types
app.use(express.static(join(__dirname, 'client/dist'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
    } else if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css; charset=UTF-8');
    } else if (path.endsWith('.html')) {
      res.setHeader('Content-Type', 'text/html; charset=UTF-8');
    }
    
    // Add cache headers for assets
    if (path.includes('/assets/')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  }
}));

// API routes can be added here
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from AliTools API!' });
});

// Configure headers to prevent CORS and optimize cache
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Cache-Control', 'public, max-age=3600'); // Cache of 1 hour
  next();
});

// SPA fallback - send all requests to index.html
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'client/dist/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app; 