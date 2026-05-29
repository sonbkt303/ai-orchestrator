import type { Response } from 'express';

function log(connectionId: string, event: string, meta: Record<string, unknown> = {}): void {
  console.log(`[sse][${connectionId}] ${event}`, meta);
}

export function initSSE(res: Response, connectionId = 'unknown'): void {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // disable nginx buffering
  res.flushHeaders();
  log(connectionId, 'opened');
}

export function writeChunk(res: Response, chunk: string, connectionId = 'unknown'): void {
  res.write(`event: chunk\ndata: ${JSON.stringify({ text: chunk })}\n\n`);
  log(connectionId, 'chunk', { chars: chunk.length });
}

export function writeDone(
  res: Response,
  meta: Record<string, unknown> = {},
  connectionId = 'unknown',
): void {
  res.write(`event: done\ndata: ${JSON.stringify(meta)}\n\n`);
  log(connectionId, 'done', meta);
}

export function writeError(res: Response, message: string, connectionId = 'unknown'): void {
  res.write(`event: error\ndata: ${JSON.stringify({ error: message })}\n\n`);
  log(connectionId, 'error', { message });
}

export function close(res: Response, connectionId = 'unknown'): void {
  log(connectionId, 'closing');
  res.end();
}
