'use strict';

const conversationService = require('./conversation.service');
const contextBuilderService = require('./context-builder.service');
const promptBuilderService = require('./prompt-builder.service');
const gatewayService = require('./gateway.service');

/**
 * Handle a non-streaming chat request.
 * @param {object} params
 * @param {string} params.message
 * @param {string} [params.conversationId]
 * @returns {Promise<{ text: string, conversationId: string }>}
 */
async function chat({ message, conversationId }) {
  const convId = conversationId || conversationService.create();
  const history = conversationService.getHistory(convId);

  const context = contextBuilderService.build({ conversationId: convId });
  const messages = promptBuilderService.build({ message, history, context });

  const text = await gatewayService.complete({ messages });

  conversationService.addMessage(convId, { role: 'user', content: message });
  conversationService.addMessage(convId, { role: 'assistant', content: text });

  return { text, conversationId: convId };
}

/**
 * Handle a streaming chat request.
 * @param {object} params
 * @param {string} params.message
 * @param {string} [params.conversationId]
 * @param {function} params.onChunk  - called with each text chunk
 * @param {function} params.onDone   - called when stream completes
 */
async function chatStream({ message, conversationId, onChunk, onDone }) {
  const convId = conversationId || conversationService.create();
  const history = conversationService.getHistory(convId);

  const context = contextBuilderService.build({ conversationId: convId });
  const messages = promptBuilderService.build({ message, history, context });

  let fullText = '';

  await gatewayService.stream({
    messages,
    onChunk: (chunk) => {
      fullText += chunk;
      onChunk(chunk);
    },
  });

  conversationService.addMessage(convId, { role: 'user', content: message });
  conversationService.addMessage(convId, { role: 'assistant', content: fullText });

  onDone({ conversationId: convId });
}

module.exports = { chat, chatStream };
