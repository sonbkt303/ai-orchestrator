import config from '../config';
import type { GatewayCompleteParams, GatewayStreamParams } from '../types';

const DEFAULT_TIMEOUT_MS = config.ai.timeoutMs;

export async function complete({ messages, jsonMode = false }: GatewayCompleteParams): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  const body: Record<string, unknown> = {
    model: config.ai.model,
    messages,
    stream: false,
  };

  if (jsonMode) {
    body.response_format = { type: 'json_object' };
  }

  let res: Response;
  try {
    res = await fetch(`${config.ai.gatewayUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.ai.apiKey}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Gateway error ${res.status}: ${body}`);
  }

  const data = await res.json() as { choices: Array<{ message: { content: string } }> };
  return data.choices[0].message.content;
}

export async function stream({ messages, onChunk }: GatewayStreamParams): Promise<void> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  // console.log('[gateway.service] stream started', {
  //   messagesCount: messages.length,
  //   messages: messages,
  // });
  let res: Response;
  try {
    res = await fetch(`${config.ai.gatewayUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.ai.apiKey}`,
      },
      body: JSON.stringify({
        model: config.ai.model,
        messages,
        stream: true,
      }),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Gateway error ${res.status}: ${body}`);
  }

  if (!res.body) {
    throw new Error('Gateway returned empty response body');
  }

  // Parse the SSE stream from the AI provider
  const decoder = new TextDecoder();
  let buffer = '';

  for await (const rawChunk of res.body as unknown as AsyncIterable<Uint8Array>) {
    buffer += decoder.decode(rawChunk, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data:')) continue;

      const data = trimmed.slice(5).trim();
      if (data === '[DONE]') return;

      let parsed: unknown;
      try {
        parsed = JSON.parse(data);
      } catch {
        continue;
      }

      const delta = (parsed as { choices?: Array<{ delta?: { content?: string } }> })
        ?.choices?.[0]?.delta?.content;
      if (delta) onChunk(delta);
    }
  }
}
