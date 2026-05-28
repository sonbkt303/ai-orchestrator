import 'dotenv/config';
import type { AppConfig } from '../types';

const config: AppConfig = {
  port: parseInt(process.env.PORT ?? '3000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',

  ai: {
    gatewayUrl: process.env.AI_GATEWAY_URL,
    apiKey: process.env.AI_API_KEY,
    model: process.env.AI_MODEL ?? 'gpt-4o',
    timeoutMs: parseInt(process.env.AI_TIMEOUT_MS ?? '30000', 10),
  },

  redis: {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
    password: process.env.REDIS_PASSWORD,
  },
};

export default config;
