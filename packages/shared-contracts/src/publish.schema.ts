import { z } from 'zod';

export const PublishRequestSchema = z.object({
  slug: z.string(),
});

export const PublishResponseSchema = z.object({
  publishedUrl: z.string().url(),
  publishedAt: z.string().datetime(),
});

export const SlugConflictErrorSchema = z.object({
  error: z.literal('SLUG_CONFLICT'),
  message: z.string(),
  suggestedSlugs: z.array(z.string()),
});

export const HomepageSettingsPatchSchema = z.object({
  siteEnabled: z.boolean().optional(),
  bookingEnabled: z.boolean().optional(),
});

export type PublishRequest = z.infer<typeof PublishRequestSchema>;
export type PublishResponse = z.infer<typeof PublishResponseSchema>;
export type SlugConflictError = z.infer<typeof SlugConflictErrorSchema>;
export type HomepageSettingsPatch = z.infer<typeof HomepageSettingsPatchSchema>;
