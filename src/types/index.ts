export type MessageRole = 'system' | 'user' | 'assistant';

export type AiRequestStatus = 'success' | 'timeout' | 'error';

export interface Message {
  role: MessageRole;
  content: string;
}

export interface Context {
  conversationId: string;
  timestamp: string;
  [key: string]: unknown;
}

export interface ChatResult {
  text: string;
  conversationId: string;
}

export type ChunkCallback = (chunk: string) => void;
export type DoneCallback = (meta: Record<string, unknown>) => void;

export interface ChatParams {
  message: string;
  conversationId?: string;
}

export interface ChatStreamParams extends ChatParams {
  onChunk: ChunkCallback;
  onDone: DoneCallback;
}

export interface GatewayCompleteParams {
  messages: Message[];
}

export interface GatewayStreamParams {
  messages: Message[];
  onChunk: ChunkCallback;
}

export interface AppConfig {
  port: number;
  nodeEnv: string;
  ai: {
    gatewayUrl: string | undefined;
    apiKey: string | undefined;
    model: string;
    timeoutMs: number;
    responseDelayMs: number;
  };
  redis: {
    host: string;
    port: number;
    password: string | undefined;
  };
  postgres: {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
  };
}
