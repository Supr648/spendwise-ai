import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import cors from 'cors';
import dotenv from 'dotenv';
import spendwiseRoutes from './routes/spendwiseRoutes.js';
import { seedDatabaseIfEmpty } from './db/database.js';

dotenv.config();

// Ensure initial database and demo user are initialized
seedDatabaseIfEmpty();

const app = express();
const server = http.createServer(app);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, '../../client/dist');
const hasClientDist = fs.existsSync(clientDistPath);

// Security Headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Middleware
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (res.statusCode >= 400 || process.env.NODE_ENV === 'development') {
      console.log(`[HTTP] ${new Date().toISOString()} ${req.method} ${req.originalUrl || req.url} ${res.statusCode} ${duration}ms`);
    }
  });
  next();
});

// Mount SpendWise Core Financial APIs
app.use('/api', spendwiseRoutes);

// Health & System Diagnostics Endpoint
app.get(['/health', '/api/health'], (req, res) => {
  const mem = process.memoryUsage();
  res.json({
    success: true,
    service: 'SpendWise AI – Personal Finance Tracker API Engine',
    version: '2.0.0',
    status: 'operational',
    tagline: 'Take Control of Your Money',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    aiEngine: process.env.GEMINI_API_KEY ? 'Gemini 1.5 Flash' : 'SpendWise Grounded Financial Engine',
    memory: {
      rssMB: Math.round((mem.rss / 1024 / 1024) * 100) / 100,
      heapUsedMB: Math.round((mem.heapUsed / 1024 / 1024) * 100) / 100,
    },
  });
});

// Favicon & Service Worker handlers
app.get('/service-worker.js', (req, res) => res.status(204).end());
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Static Client SPA Serving (when client is built)
if (hasClientDist) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path === '/health') {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({
      success: true,
      service: 'SpendWise AI – Personal Finance Tracker REST API',
      tagline: 'Take Control of Your Money',
      status: 'active',
      endpoints: [
        'POST /api/auth/register',
        'POST /api/auth/login',
        'GET /api/auth/me',
        'GET /api/dashboard/summary',
        'GET /api/transactions',
        'POST /api/transactions',
        'GET /api/budgets',
        'GET /api/goals',
        'GET /api/recurring',
        'GET /api/reports',
        'POST /api/ai/insights',
      ],
    });
  });
}

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.originalUrl}`,
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Application Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error in SpendWise Engine',
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 SpendWise AI Server running on http://localhost:${PORT}`);
  console.log(`💰 Personal Finance Intelligence Engine initialized`);
});

// Graceful shutdown handling for container deployments (SIGTERM, SIGINT)
const gracefulShutdown = (signal) => {
  console.log(`Received ${signal}. Gracefully terminating SpendWise AI server...`);
  server.close(() => {
    console.log('SpendWise AI HTTP server closed cleanly.');
    process.exit(0);
  });
  setTimeout(() => {
    console.error('Forceful shutdown timeout reached. Terminating process.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Process-level crash prevention handlers to prevent server dying on uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT_EXCEPTION]', new Date().toISOString(), err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[UNHANDLED_REJECTION]', new Date().toISOString(), reason);
});
