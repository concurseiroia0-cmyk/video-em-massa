/**
 * BatchPost Collection Server
 *
 * Backend API for collecting public video content from Instagram and TikTok.
 * Uses yt-dlp (open-source) for data collection.
 *
 * START:
 *   npx tsx src/server/index.ts
 *   # or
 *   npm run server
 *
 * The server runs on http://localhost:3001
 * The frontend connects to this server automatically when available.
 *
 * SECURITY:
 * - No credentials required
 * - Only public content
 * - CORS configured for localhost only
 * - Input validation on all endpoints
 */

import express from 'express';
import cors from 'cors';
import collectRoutes from './routes/collect.js';

const app = express();
const PORT = Number(process.env['PORT']) || 3001;

// ── Middleware ──────────────────────────────────────────────────

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:4173',
    'http://127.0.0.1:5173',
  ],
  methods: ['GET', 'POST'],
}));

app.use(express.json());

// ── Request Logging ────────────────────────────────────────────

app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ── Routes ─────────────────────────────────────────────────────

app.use('/api', collectRoutes);

// ── 404 ────────────────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ── Error Handler ──────────────────────────────────────────────

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Start ──────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════╗
║  BatchPost Collection Server                 ║
║  Running on http://localhost:${PORT}            ║
║                                              ║
║  Endpoints:                                  ║
║    POST /api/collect  - Collect videos       ║
║    GET  /api/health   - Health check         ║
╚══════════════════════════════════════════════╝
  `);
});
