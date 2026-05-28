import fs from 'fs';
import path from 'path';
import type { Message, Context } from '../types';

const SYSTEM_PROMPT_PATH = path.join(__dirname, '../prompts/system.txt');

let _systemPrompt: string | null = null;

function getSystemPrompt(): string {
  if (!_systemPrompt) {
    _systemPrompt = fs.readFileSync(SYSTEM_PROMPT_PATH, 'utf8').trim();
  }
  return _systemPrompt;
}

function buildSystemContent(context: Context | Record<string, unknown>): string {
  const base = getSystemPrompt();

  if (!context || Object.keys(context).length === 0) {
    return base;
  }

  const contextBlock = Object.entries(context)
    .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
    .join('\n');

  return `${base}\n\n## Context\n${contextBlock}`;
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
