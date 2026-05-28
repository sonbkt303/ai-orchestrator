'use strict';

const aiService = require('../services/ai.service');
const streamService = require('../services/stream.service');

/**
 * POST /ai/chat
 * Non-streaming chat — returns full response as JSON.
 */
async function chat(req, res) {
  const { message, conversationId } = req.body;

  if (!message || typeof message !== 'string' || message.trim() === '') {
    return res.status(400).json({ error: 'message is required' });
  }

  const reply = await aiService.chat({ message: message.trim(), conversationId });
  return res.json({ reply, conversationId: reply.conversationId });
}

/**
 * POST /ai/chat/stream
 * Streaming chat — responds via SSE.
 */
async function chatStream(req, res) {
  const { message, conversationId } = req.body;

  if (!message || typeof message !== 'string' || message.trim() === '') {
    return res.status(400).json({ error: 'message is required' });
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
    streamService.writeError(res, err.message);
  } finally {
    streamService.close(res);
  }
}

/**
 * GET /ai/conversations/:id
 * Return conversation history.
 */
async function getConversation(req, res) {
  const conversationService = require('../services/conversation.service');
  const history = conversationService.getHistory(req.params.id);

  if (!history) {
    return res.status(404).json({ error: 'Conversation not found' });
  }

  return res.json({ conversationId: req.params.id, messages: history });
}

module.exports = { chat, chatStream, getConversation };
