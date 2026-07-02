import {
  GenerateHomepageRequest,
  GenerateHomepageRequestSchema,
  GenerateHomepageResponse,
  GenerateHomepageResponseSchema,
} from '@clever-dent/shared-contracts';
import * as gateway from './gateway.service';
import {
  buildHomepageGenerateSystemPrompt,
  buildHomepageGenerateUserPrompt,
} from '../prompts/homepage-generate.prompt';

function extractJsonFromText(text: string): unknown {
  const trimmed = text.trim();
  const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonText = codeBlockMatch ? codeBlockMatch[1].trim() : trimmed;
  return JSON.parse(jsonText);
}

async function callGateway(input: GenerateHomepageRequest, retryHint?: string): Promise<string> {
  const systemPrompt = buildHomepageGenerateSystemPrompt();
  const userPrompt = buildHomepageGenerateUserPrompt(input);
  const messages = [
    { role: 'system' as const, content: systemPrompt },
    {
      role: 'user' as const,
      content: retryHint ? `${userPrompt}\n\nFix validation errors:\n${retryHint}` : userPrompt,
    },
  ];

  return gateway.complete({ messages, jsonMode: true });
}

export async function generateHomepage(
  rawInput: unknown,
): Promise<GenerateHomepageResponse> {
  const input = GenerateHomepageRequestSchema.parse(rawInput);

  let lastError: string | undefined;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const raw = await callGateway(input, lastError);
    let parsed: unknown;

    try {
      parsed = extractJsonFromText(raw);
    } catch {
      lastError = 'Response was not valid JSON';
      continue;
    }

    const result = GenerateHomepageResponseSchema.safeParse(parsed);
    if (result.success) {
      return result.data;
    }

    lastError = result.error.message;
  }

  throw new Error(`Failed to generate valid homepage content: ${lastError ?? 'unknown error'}`);
}
