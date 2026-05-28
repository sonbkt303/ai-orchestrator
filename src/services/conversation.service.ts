import type { Message } from '../types';
import * as conversationRepo from '../db/repositories/conversation.repository';
import * as messageRepo from '../db/repositories/message.repository';

export async function create(): Promise<string> {
  return conversationRepo.create();
}

export async function getHistory(id: string): Promise<Message[] | null> {
  const conversation = await conversationRepo.findById(id);
  if (!conversation) return null;

  const rows = await messageRepo.findByConversationId(id);
  return rows.map((r) => ({ role: r.role, content: r.content }));
}

export async function addMessage(id: string, message: Message): Promise<void> {
  await messageRepo.insert(id, message.role, message.content);
  await conversationRepo.touchUpdatedAt(id);
}

export async function listAll(): Promise<{ id: string; createdAt: string }[]> {
  const rows = await conversationRepo.listAll();
  return rows.map((r) => ({ id: r.id, createdAt: r.createdAt }));
}

export async function remove(id: string): Promise<void> {
  await conversationRepo.remove(id);
}
