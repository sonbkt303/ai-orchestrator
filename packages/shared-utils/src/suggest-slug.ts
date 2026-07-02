import { normalizeSlugInput, validateSlug } from './slug';

export interface SuggestSlugInput {
  name: string;
  district?: string;
  city?: string;
}

export function suggestSlugs(
  input: SuggestSlugInput,
  takenSlugs: Set<string> = new Set(),
  maxSuggestions = 5,
): string[] {
  const base = normalizeSlugInput(input.name);
  if (!base) {
    return [];
  }

  const district = input.district ? normalizeSlugInput(input.district) : undefined;
  const city = input.city ? normalizeSlugInput(input.city) : undefined;

  const candidates: string[] = [];

  if (district) {
    candidates.push(`${base}-${district}`);
  }

  if (city) {
    candidates.push(`${base}-${city}`);
  }

  if (district && city) {
    candidates.push(`${base}-${district}-${city}`);
  }

  candidates.push(base);

  for (let i = 2; i <= maxSuggestions + 3; i += 1) {
    if (city) {
      candidates.push(`${base}-${city}-${i}`);
    } else if (district) {
      candidates.push(`${base}-${district}-${i}`);
    } else {
      candidates.push(`${base}-${i}`);
    }
  }

  const unique: string[] = [];
  const seen = new Set<string>();

  for (const candidate of candidates) {
    if (seen.has(candidate)) {
      continue;
    }
    seen.add(candidate);

    const result = validateSlug(candidate, takenSlugs);
    if (result.valid) {
      unique.push(candidate);
    }

    if (unique.length >= maxSuggestions) {
      break;
    }
  }

  return unique;
}
