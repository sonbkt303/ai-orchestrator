import sql from '../client';
import type { MessageRole } from '../../types';

export interface MessageRow {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  seq: number;
  language: string;
  createdAt: string;
}

export async function nextSeq(conversationId: string): Promise<number> {
  const [row] = await sql<[{ max: number | null }]>`
    SELECT MAX(seq) AS max
    FROM messages
    WHERE conversation_id = ${conversationId}
  `;
  return (row.max ?? 0) + 1;
}

export async function insert(
  conversationId: string,
  role: MessageRole,
  content: string,
  language = 'simple',
): Promise<MessageRow> {
  const seq = await nextSeq(conversationId);

  const [row] = await sql<[MessageRow]>`
    INSERT INTO messages (conversation_id, role, content, language, seq)
    VALUES (${conversationId}, ${role}, ${content}, ${language}, ${seq})
    RETURNING id, conversation_id, role, content, seq, language, created_at
  `;
  return row;
}

export async function findByConversationId(conversationId: string): Promise<MessageRow[]> {
  return sql<MessageRow[]>`
    SELECT id, conversation_id, role, content, seq, language, created_at
    FROM messages
    WHERE conversation_id = ${conversationId}
    ORDER BY seq ASC
  `;
}
