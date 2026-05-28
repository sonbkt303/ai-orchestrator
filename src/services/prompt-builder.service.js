'use strict';

const fs = require('fs');
const path = require('path');

const SYSTEM_PROMPT_PATH = path.join(__dirname, '../prompts/system.txt');

let _systemPrompt = null;

function getSystemPrompt() {
  if (!_systemPrompt) {
    _systemPrompt = fs.readFileSync(SYSTEM_PROMPT_PATH, 'utf8').trim();
  }
  return _systemPrompt;
}

/**
 * Build the messages array to send to the AI gateway.
 *
 * @param {object} params
 * @param {string} params.message           - latest user message
 * @param {Array}  params.history           - previous conversation messages
 * @param {object} params.context           - injected context from context-builder
 * @returns {Array<{role: string, content: string}>}
 */
function build({ message, history = [], context = {} }) {
  const systemContent = buildSystemContent(context);

  const messages = [
    { role: 'system', content: systemContent },
    ...history,
    { role: 'user', content: message },
  ];

  return messages;
}

/**
 * Compose the system prompt with optional context block.
 */
function buildSystemContent(context) {
  const base = getSystemPrompt();

  if (!context || Object.keys(context).length === 0) {
    return base;
  }

  const contextBlock = Object.entries(context)
    .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
    .join('\n');

  return `${base}\n\n## Context\n${contextBlock}`;
}

module.exports = { build };
