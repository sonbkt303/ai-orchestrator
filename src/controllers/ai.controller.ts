import type { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import * as aiService from '../services/ai.service';
import * as streamService from '../services/stream.service';
import * as conversationService from '../services/conversation.service';

/**
 * POST /ai/chat
 * Non-streaming chat — returns full response as JSON.
 */
export async function chat(req: Request, res: Response): Promise<void> {
  const { message, conversationId } = req.body as { message?: unknown; conversationId?: string };

  if (!message || typeof message !== 'string' || message.trim() === '') {
    res.status(400).json({ error: 'message is required' });
    return;
  }

  const reply = await aiService.chat({ message: message.trim(), conversationId });
  res.json({ reply, conversationId: reply.conversationId });
}

/**
 * POST /ai/chat/stream
 * Streaming chat — responds via SSE.
 */
export async function chatStream(req: Request, res: Response): Promise<void> {
  const { message, conversationId } = req.body as { message?: unknown; conversationId?: string };

  if (!message || typeof message !== 'string' || message.trim() === '') {
    res.status(400).json({ error: 'message is required' });
    return;
  }

  const streamId = randomUUID();
  const startedAt = Date.now();
  let chunkCount = 0;
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';

  console.log('[ai.controller] stream request received', {
    streamId,
    conversationId: conversationId ?? null,
    clientIp,
  });

  req.on('close', () => {
    console.log('[ai.controller] client disconnected', {
      streamId,
      elapsedMs: Date.now() - startedAt,
      chunkCount,
    });
  });

  streamService.initSSE(res, streamId);

  try {
    await aiService.chatStream({
      message: message.trim(),
      conversationId,
      onChunk: (chunk) => {
        chunkCount += 1;
        streamService.writeChunk(res, chunk, streamId);
      },
      onDone: (meta) => streamService.writeDone(res, meta, streamId),
    });
  } catch (err) {
    streamService.writeError(res, err instanceof Error ? err.message : 'Unknown error', streamId);
  } finally {
    streamService.close(res, streamId);
    console.log('[ai.controller] stream request closed', {
      streamId,
      elapsedMs: Date.now() - startedAt,
      chunkCount,
    });
  }
}

/**
 * GET /ai/conversations
 * Return a list of all conversations (id, messageCount, createdAt).
 */
export async function listConversations(_req: Request, res: Response): Promise<void> {
  res.json(await conversationService.listAll());
}

/**
 * GET /ai/conversations/:id
 * Return conversation history.
 */
export async function getConversation(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  const history = await conversationService.getHistory(id);

  if (!history) {
    res.status(404).json({ error: 'Conversation not found' });
    return;
  }

  res.json({ conversationId: id, messages: history });
}
