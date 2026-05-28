'use strict';

/**
 * Build the context object to be injected into the prompt.
 * Extend this function to include business data, user metadata,
 * permissions, or any other runtime context.
 *
 * @param {object} params
 * @param {string} params.conversationId
 * @returns {object}
 */
function build({ conversationId }) {
  return {
    conversationId,
    timestamp: new Date().toISOString(),
    // TODO: inject user identity, permissions, business data as needed
  };
}

module.exports = { build };
