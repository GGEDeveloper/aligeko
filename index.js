// Simple Express server for SPA
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import cors from 'cors';

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Configure CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://alitools-b2b.vercel.app', 'https://aligekow-iwznrnlz0-alitools-projects.vercel.app'] 
    : 'http://localhost:3000',
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

// API routes - redirect to server
app.use('/api', (req, res) => {
  // Redirect API calls to the server directory
  import('./server/index.js').then(serverModule => {
    // Forward the request to the server module
    serverModule.default(req, res);
  }).catch(err => {
    console.error('Error loading server module:', err);
    res.status(500).json({ error: 'Internal Server Error' });
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
