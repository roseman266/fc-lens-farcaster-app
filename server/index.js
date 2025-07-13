import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createServer as createViteServer } from 'vite';
import routes from './routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.coingecko.com", "https://api.etherscan.io"],
      frameSrc: ["'self'", "https://warpcast.com"],
    },
  },
}));

app.use(cors());
app.use(express.json());

// API routes
app.use(routes);

// Create Vite server in middleware mode
const vite = await createViteServer({
  server: { middlewareMode: true },
  appType: 'spa',
  root: join(__dirname, '../client'),
  resolve: {
    alias: {
      '@': join(__dirname, '../client/src'),
      '@shared': join(__dirname, '../shared'),
      '@assets': join(__dirname, '../client/assets'),
    },
  },
});

// Use Vite's connect instance as middleware
app.use(vite.ssrFixStacktrace);
app.use(vite.middlewares);

// Serve Farcaster Mini App manifest
app.get('/.well-known/farcaster.json', (req, res) => {
  res.json({
    version: "1",
    name: "FC Lens",
    iconUrl: `${req.protocol}://${req.get('host')}/icon.png`,
    homeUrl: `${req.protocol}://${req.get('host')}/`,
    imageUrl: `${req.protocol}://${req.get('host')}/preview.png`,
    buttonTitle: "Analyze Token",
    splashImageUrl: `${req.protocol}://${req.get('host')}/splash.png`,
    splashBackgroundColor: "#1a1a1a"
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 FC Lens server running on http://0.0.0.0:${PORT}`);
  console.log(`📱 Farcaster Mini App manifest: http://0.0.0.0:${PORT}/.well-known/farcaster.json`);
});
