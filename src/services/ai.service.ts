import * as conversationService from './conversation.service';
import * as contextBuilderService from './context-builder.service';
import * as promptBuilderService from './prompt-builder.service';
import * as gatewayService from './gateway.service';
import type { ChatParams, ChatStreamParams, ChatResult } from '../types';

export async function chat({ message, conversationId }: ChatParams): Promise<ChatResult> {
  const convId = conversationId ?? conversationService.create();
  const history = conversationService.getHistory(convId) ?? [];

  const context = contextBuilderService.build({ conversationId: convId });
  const messages = promptBuilderService.build({ message, history, context });

  const text = await gatewayService.complete({ messages });

  conversationService.addMessage(convId, { role: 'user', content: message });
  conversationService.addMessage(convId, { role: 'assistant', content: text });

  return { text, conversationId: convId };
}

export async function chatStream({
  message,
  conversationId,
  onChunk,
  onDone,
}: ChatStreamParams): Promise<void> {
  const convId = conversationId ?? conversationService.create();
  const history = conversationService.getHistory(convId) ?? [];

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
