import type { Message, Context } from '../types';

const DEFAULT_SYSTEM_PROMPT =
  'You are a helpful AI assistant.\nAnswer clearly and concisely.\nIf you are unsure about something, say so.';

function buildSystemContent(context: Context | Record<string, unknown>): string {
  if (!context || Object.keys(context).length === 0) {
    return DEFAULT_SYSTEM_PROMPT;
  }

  const contextBlock = Object.entries(context)
    .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
    .join('\n');

  return `${DEFAULT_SYSTEM_PROMPT}\n\n## Context\n${contextBlock}`;
}

export function build({
  message,
  history = [],
  context = {},
}: {
  message: string;
  history?: Message[];
  context?: Context | Record<string, unknown>;
}): Message[] {
  const systemContent = buildSystemContent(context);

  return [
    { role: 'system', content: systemContent },
    ...history,
    { role: 'user', content: message },
  ];
}
