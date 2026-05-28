'use strict';

const { randomUUID } = require('crypto');

/** @type {Map<string, Array<{role: string, content: string}>>} */
const store = new Map();

/**
 * Create a new conversation and return its ID.
 * @returns {string}
 */
function create() {
  const id = randomUUID();
  store.set(id, []);
  return id;
}

/**
 * Get message history for a conversation.
 * Returns null if not found.
 * @param {string} id
 * @returns {Array<{role: string, content: string}> | null}
 */
function getHistory(id) {
  return store.has(id) ? [...store.get(id)] : null;
}

/**
 * Append a message to a conversation.
 * Creates the conversation if it does not exist.
 * @param {string} id
 * @param {{ role: string, content: string }} message
 */
function addMessage(id, message) {
  if (!store.has(id)) {
    store.set(id, []);
  }
  store.get(id).push(message);
}

/**
 * Delete a conversation from the store.
 * @param {string} id
 */
function remove(id) {
  store.delete(id);
}

module.exports = { create, getHistory, addMessage, remove };
