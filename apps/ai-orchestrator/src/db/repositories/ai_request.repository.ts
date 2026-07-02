import sql from '../client';
import type { AiRequestStatus } from '../../types';

export interface AiRequestRow {
  id: string;
  conversationId: string;
  userMessageId: string | null;
  assistantMessageId: string | null;
  model: string;
  latencyMs: number;
  status: AiRequestStatus;
  errorText: string | null;
  createdAt: string;
}

export interface InsertRequestParams {
  conversationId: string;
  userMessageId: string | null;
  assistantMessageId: string | null;
  model: string;
  latencyMs: number;
  status: AiRequestStatus;
  errorText?: string | null;
}

export interface InsertUsageParams {
  requestId: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost?: number | null;
}

export async function insertRequest(params: InsertRequestParams): Promise<string> {
  const [row] = await sql<[{ id: string }]>`
    INSERT INTO ai_requests (
      conversation_id,
      user_message_id,
      assistant_message_id,
      model,
      latency_ms,
      status,
      error_text
    ) VALUES (
      ${params.conversationId},
      ${params.userMessageId},
      ${params.assistantMessageId},
      ${params.model},
      ${params.latencyMs},
      ${params.status},
      ${params.errorText ?? null}
    )
    RETURNING id
  `;
  return row.id;
}

export async function insertUsage(params: InsertUsageParams): Promise<void> {
  await sql`
    INSERT INTO ai_usage (
      request_id,
      prompt_tokens,
      completion_tokens,
      total_tokens,
      cost
    ) VALUES (
      ${params.requestId},
      ${params.promptTokens},
      ${params.completionTokens},
      ${params.totalTokens},
      ${params.cost ?? null}
    )
  `;
}
