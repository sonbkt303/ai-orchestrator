import * as conversationService from './conversation.service';
import * as contextBuilderService from './context-builder.service';
import * as promptBuilderService from './prompt-builder.service';
import * as gatewayService from './gateway.service';
import * as aiRequestRepo from '../db/repositories/ai_request.repository';
import config from '../config';
import type { AiRequestStatus, ChatParams, ChatStreamParams, ChatResult } from '../types';

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

export async function chat({ message, conversationId }: ChatParams): Promise<ChatResult> {
  const convId = conversationId ?? await conversationService.create();
  const history = await conversationService.getHistory(convId) ?? [];

  const context = contextBuilderService.build({ conversationId: convId });
  const messages = promptBuilderService.build({ message, history, context });

  let text = '';
  let status: AiRequestStatus = 'success';
  let errorText: string | null = null;
  const t0 = Date.now();

  try {
    text = await gatewayService.complete({ messages });
  } catch (err) {
    status = err instanceof Error && err.name === 'AbortError' ? 'timeout' : 'error';
    errorText = err instanceof Error ? err.message : String(err);
    const latencyMs = Date.now() - t0;
    await aiRequestRepo.insertRequest({
      conversationId: convId,
      userMessageId: null,
      assistantMessageId: null,
      model: config.ai.model,
      latencyMs,
      status,
      errorText,
    });
    throw err;
  }

  const latencyMs = Date.now() - t0;

  const userMsgId = await conversationService.addMessage(convId, { role: 'user', content: message });
  const assistantMsgId = await conversationService.addMessage(convId, { role: 'assistant', content: text });

  await aiRequestRepo.insertRequest({
    conversationId: convId,
    userMessageId: userMsgId,
    assistantMessageId: assistantMsgId,
    model: config.ai.model,
    latencyMs,
    status,
    errorText,
  });

  if (config.ai.responseDelayMs > 0) {
    await sleep(config.ai.responseDelayMs);
  }

  return { text, conversationId: convId };
}

export async function chatStream({
  message,
  conversationId,
  onChunk,
  onDone,
}: ChatStreamParams): Promise<void> {
  const convId = conversationId ?? await conversationService.create();
  const history = await conversationService.getHistory(convId) ?? [];

  const context = contextBuilderService.build({ conversationId: convId });
  const messages = promptBuilderService.build({ message, history, context });

  let fullText = '';
  let chunkCount = 0;
  let status: AiRequestStatus = 'success';
  let errorText: string | null = null;
  const t0 = Date.now();

  console.log('[ai.service] stream started', {
    conversationId: convId,
    historyCount: history.length,
    promptMessages: messages.length,
  });
  try {
    // if (config.ai.responseDelayMs > 0) {
    //   console.log(`[ai.service] simulating response delay of ${config.ai.responseDelayMs}ms`);
    //   await sleep(config.ai.responseDelayMs);
    // }

    await gatewayService.stream({
      messages,
      onChunk: (chunk) => {
        chunkCount += 1;
        fullText += chunk;
        onChunk(chunk);
      },
    });
    
  } catch (err) {
    status = err instanceof Error && err.name === 'AbortError' ? 'timeout' : 'error';
    errorText = err instanceof Error ? err.message : String(err);
    const latencyMs = Date.now() - t0;
    await aiRequestRepo.insertRequest({
      conversationId: convId,
      userMessageId: null,
      assistantMessageId: null,
      model: config.ai.model,
      latencyMs,
      status,
      errorText,
    });
    throw err;
  }

  const latencyMs = Date.now() - t0;

  const userMsgId = await conversationService.addMessage(convId, { role: 'user', content: message });
  const assistantMsgId = await conversationService.addMessage(convId, { role: 'assistant', content: fullText });

  await aiRequestRepo.insertRequest({
    conversationId: convId,
    userMessageId: userMsgId,
    assistantMessageId: assistantMsgId,
    model: config.ai.model,
    latencyMs,
    status,
    errorText,
  });

  console.log('[ai.service] stream completed', {
    conversationId: convId,
    chunkCount,
    responseChars: fullText.length,
    latencyMs,
  });

  onDone({ conversationId: convId });
}
