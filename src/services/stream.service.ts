import type { Response } from 'express';

export function initSSE(res: Response): void {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // disable nginx buffering
  res.flushHeaders();
}

export function writeChunk(res: Response, chunk: string): void {
  res.write(`event: chunk\ndata: ${JSON.stringify({ text: chunk })}\n\n`);
}

export function writeDone(res: Response, meta: Record<string, unknown> = {}): void {
  res.write(`event: done\ndata: ${JSON.stringify(meta)}\n\n`);
}

export function writeError(res: Response, message: string): void {
  res.write(`event: error\ndata: ${JSON.stringify({ error: message })}\n\n`);
}

export function close(res: Response): void {
  res.end();
}
