import type { Context } from '../types';

export function build({ conversationId }: { conversationId: string }): Context {
  return {
    conversationId,
    timestamp: new Date().toISOString(),
    // TODO: inject user identity, permissions, business data as needed
  };
}
