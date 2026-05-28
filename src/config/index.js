'use strict';

require('dotenv').config();

const config = {
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',

  ai: {
    gatewayUrl: process.env.AI_GATEWAY_URL,
    apiKey: process.env.AI_API_KEY,
    model: process.env.AI_MODEL || 'gpt-4o',
    timeoutMs: parseInt(process.env.AI_TIMEOUT_MS, 10) || 30000,
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
  },
};

module.exports = config;
