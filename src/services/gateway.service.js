'use strict';

const config = require('../config');

const DEFAULT_TIMEOUT_MS = config.ai.timeoutMs;

/**
 * Send a non-streaming completion request to the AI Gateway.
 * @param {object} params
 * @param {Array<{role: string, content: string}>} params.messages
 * @returns {Promise<string>} assistant text
 */
async function complete({ messages }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  let res;
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
        stream: false,
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

  const data = await res.json();
  return data.choices[0].message.content;
}

/**
 * Send a streaming completion request to the AI Gateway.
 * Calls onChunk for each text delta.
 * @param {object} params
 * @param {Array<{role: string, content: string}>} params.messages
 * @param {function} params.onChunk
 */
async function stream({ messages, onChunk }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  let res;
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

  // Parse the SSE stream from the AI provider
  const decoder = new TextDecoder();
  let buffer = '';

  for await (const rawChunk of res.body) {
    buffer += decoder.decode(rawChunk, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop(); // keep incomplete line in buffer

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data:')) continue;

      const data = trimmed.slice(5).trim();
      if (data === '[DONE]') return;

      let parsed;
      try {
        parsed = JSON.parse(data);
      } catch {
        continue;
      }

      const delta = parsed?.choices?.[0]?.delta?.content;
      if (delta) onChunk(delta);
    }
  }
}

module.exports = { complete, stream };
