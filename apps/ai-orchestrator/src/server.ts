import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import config from './config';
import aiRoutes from './routes/ai.routes';
import homepageRoutes from './routes/homepage.routes';

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/ai', aiRoutes);
app.use('/ai/homepage', homepageRoutes);

// ── Frontend (static) — only at /chat ───────────────────────────────────────
const frontendDir = path.join(__dirname, '../src/frontend');

app.use('/chat', express.static(frontendDir, { index: false, redirect: false }));

app.get(['/chat', '/chat/'], (_req: Request, res: Response) => {
  res.sendFile(path.join(frontendDir, 'index.html'));
});

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

// ── Global error handler ──────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[server] unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(config.port, () => {
  console.log(`[server] running on port ${config.port} (${config.nodeEnv})`);
});

export default app;
