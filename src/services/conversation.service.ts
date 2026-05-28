import { randomUUID } from 'crypto';
import type { Message } from '../types';

interface ConversationEntry {
  messages: Message[];
  createdAt: string;
}

const store = new Map<string, ConversationEntry>();

export function create(): string {
  const id = randomUUID();
  store.set(id, { messages: [], createdAt: new Date().toISOString() });
  return id;
}

export function getHistory(id: string): Message[] | null {
  const entry = store.get(id);
  return entry ? [...entry.messages] : null;
}

export function addMessage(id: string, message: Message): void {
  if (!store.has(id)) {
    store.set(id, { messages: [], createdAt: new Date().toISOString() });
  }
  store.get(id)!.messages.push(message);
}

export function listAll(): { id: string; messageCount: number; createdAt: string }[] {
  return Array.from(store.entries()).map(([id, entry]) => ({
    id,
    messageCount: entry.messages.length,
    createdAt: entry.createdAt,
  }));
}

export function remove(id: string): void {
  store.delete(id);
}
