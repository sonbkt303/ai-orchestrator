import sql from '../client';

export interface ConversationRow {
  id: string;
  status: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export async function create(): Promise<string> {
  const [row] = await sql<[{ id: string }]>`
    INSERT INTO conversations DEFAULT VALUES
    RETURNING id
  `;
  return row.id;
}

export async function findById(id: string): Promise<ConversationRow | null> {
  const [row] = await sql<ConversationRow[]>`
    SELECT id, status, metadata, created_at, updated_at
    FROM conversations
    WHERE id = ${id}
  `;
  return row ?? null;
}

export async function listAll(): Promise<{ id: string; createdAt: string; updatedAt: string }[]> {
  return sql<{ id: string; createdAt: string; updatedAt: string }[]>`
    SELECT id, created_at, updated_at
    FROM conversations
    WHERE status != 'deleted'
    ORDER BY updated_at DESC
  `;
}

export async function touchUpdatedAt(id: string): Promise<void> {
  await sql`
    UPDATE conversations
    SET updated_at = NOW()
    WHERE id = ${id}
  `;
}

export async function remove(id: string): Promise<void> {
  await sql`
    UPDATE conversations
    SET status = 'deleted'
    WHERE id = ${id}
  `;
}
