// Simple Express server for SPA
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Serve static files from the React app
app.use(express.static(join(__dirname, 'client/dist')));

// API routes can be added here
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from AliTools API!' });
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'client/dist/index.html'));
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app; 