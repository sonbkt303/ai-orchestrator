'use strict';

/**
 * Initialize SSE response headers.
 * Must be called before any write.
 * @param {import('express').Response} res
 */
function initSSE(res) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // disable nginx buffering
  res.flushHeaders();
}

/**
 * Write a text chunk event.
 * @param {import('express').Response} res
 * @param {string} chunk
 */
function writeChunk(res, chunk) {
  res.write(`event: chunk\ndata: ${JSON.stringify({ text: chunk })}\n\n`);
}

/**
 * Write a done event with optional metadata.
 * @param {import('express').Response} res
 * @param {object} [meta]
 */
function writeDone(res, meta = {}) {
  res.write(`event: done\ndata: ${JSON.stringify(meta)}\n\n`);
}

/**
 * Write an error event.
 * @param {import('express').Response} res
 * @param {string} message
 */
function writeError(res, message) {
  res.write(`event: error\ndata: ${JSON.stringify({ error: message })}\n\n`);
}

/**
 * Close the SSE connection.
 * @param {import('express').Response} res
 */
function close(res) {
  res.end();
}

module.exports = { initSSE, writeChunk, writeDone, writeError, close };
