import dotenv from 'dotenv';

dotenv.config();

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

const config = {
  port: parseInt(process.env.PORT ?? '3002', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  postgres: {
    host: required('POSTGRES_HOST', 'localhost'),
    port: parseInt(process.env.POSTGRES_PORT ?? '5434', 10),
    user: required('POSTGRES_USER', 'postgres'),
    password: required('POSTGRES_PASSWORD', 'postgres'),
    database: required('POSTGRES_DB', 'homepage_platform'),
  },
  aiOrchestratorUrl: required('AI_ORCHESTRATOR_URL', 'http://localhost:4000'),
  publicSiteUrl: required('PUBLIC_SITE_URL', 'http://localhost:3000'),
  revalidateSecret: required('REVALIDATE_SECRET', 'dev-secret'),
};

export default config;
