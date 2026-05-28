import { randomUUID } from 'crypto';
import type { Message } from '../types';

const store = new Map<string, Message[]>();

export function create(): string {
  const id = randomUUID();
  store.set(id, []);
  return id;
}

export function getHistory(id: string): Message[] | null {
  return store.has(id) ? [...store.get(id)!] : null;
}

export function addMessage(id: string, message: Message): void {
  if (!store.has(id)) {
    store.set(id, []);
  }
  store.get(id)!.push(message);
}

export function remove(id: string): void {
  store.delete(id);
}
