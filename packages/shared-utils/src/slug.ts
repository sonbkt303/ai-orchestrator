export const SLUG_REGEX = /^[a-z0-9-]+$/;
export const SLUG_MIN_LENGTH = 3;
export const SLUG_MAX_LENGTH = 63;

export const RESERVED_SLUGS = new Set([
  'www',
  'api',
  'admin',
  'app',
  'staging',
  'dev',
  'mail',
  'ftp',
  'cdn',
  'static',
  'assets',
  'help',
  'support',
  'blog',
  'status',
  'docs',
  'public',
  'booking',
  'health',
  'robots',
  'sitemap',
]);

export interface SlugValidationResult {
  valid: boolean;
  error?: string;
}

export function normalizeSlugInput(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function validateSlug(
  slug: string,
  takenSlugs: Set<string> = new Set(),
): SlugValidationResult {
  if (slug.length < SLUG_MIN_LENGTH) {
    return { valid: false, error: `Slug must be at least ${SLUG_MIN_LENGTH} characters` };
  }

  if (slug.length > SLUG_MAX_LENGTH) {
    return { valid: false, error: `Slug must be at most ${SLUG_MAX_LENGTH} characters` };
  }

  if (!SLUG_REGEX.test(slug)) {
    return { valid: false, error: 'Slug may only contain lowercase letters, numbers, and hyphens' };
  }

  if (RESERVED_SLUGS.has(slug)) {
    return { valid: false, error: 'Slug is reserved' };
  }

  if (takenSlugs.has(slug)) {
    return { valid: false, error: 'Slug is already taken' };
  }

  return { valid: true };
}
