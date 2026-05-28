import type { Request, Response } from 'express';
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

  streamService.initSSE(res);

  try {
    await aiService.chatStream({
      message: message.trim(),
      conversationId,
      onChunk: (chunk) => streamService.writeChunk(res, chunk),
      onDone: (meta) => streamService.writeDone(res, meta),
    });
  } catch (err) {
    streamService.writeError(res, err instanceof Error ? err.message : 'Unknown error');
  } finally {
    streamService.close(res);
  }
}

/**
 * GET /ai/conversations
 * Return a list of all conversations (id, messageCount, createdAt).
 */
export function listConversations(_req: Request, res: Response): void {
  res.json(conversationService.listAll());
}

/**
 * GET /ai/conversations/:id
 * Return conversation history.
 */
export async function getConversation(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  const history = conversationService.getHistory(id);

  if (!history) {
    res.status(404).json({ error: 'Conversation not found' });
    return;
  }

  res.json({ conversationId: id, messages: history });
}
