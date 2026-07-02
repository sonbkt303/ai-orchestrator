import { z } from 'zod';
import {
  ClinicProfileSchema,
  ContentStyleSchema,
  HomepageDraftSchema,
  SeoSchema,
  SectionsSchema,
} from './homepage.schema';

export const GenerateHomepageInputServiceSchema = z.object({
  serviceId: z.string().uuid(),
  name: z.string(),
  shortDescription: z.string().optional(),
  iconKey: z.string().optional(),
});

export const GenerateHomepageInputDoctorSchema = z.object({
  doctorId: z.string().uuid(),
  name: z.string(),
  specialty: z.string().optional(),
  bio: z.string().optional(),
  photoUrl: z.string().url().nullable().optional(),
});

export const GenerateHomepageRequestSchema = z.object({
  clinicProfile: ClinicProfileSchema,
  services: z.array(GenerateHomepageInputServiceSchema),
  doctors: z.array(GenerateHomepageInputDoctorSchema),
  contentStyle: ContentStyleSchema.default('warm'),
  templateId: z.string().default('template-1'),
  slug: z.string().optional(),
  siteEnabled: z.boolean().default(true),
  bookingEnabled: z.boolean().default(true),
});

export const GenerateHomepageResponseSchema = z.object({
  sections: SectionsSchema,
  seo: SeoSchema,
});

export const GenerateHomepageAdminResponseSchema = z.object({
  draft: HomepageDraftSchema,
  suggestedSlugs: z.array(z.string()).optional(),
});

export type GenerateHomepageInputService = z.infer<typeof GenerateHomepageInputServiceSchema>;
export type GenerateHomepageInputDoctor = z.infer<typeof GenerateHomepageInputDoctorSchema>;
export type GenerateHomepageRequest = z.infer<typeof GenerateHomepageRequestSchema>;
export type GenerateHomepageResponse = z.infer<typeof GenerateHomepageResponseSchema>;
export type GenerateHomepageAdminResponse = z.infer<typeof GenerateHomepageAdminResponseSchema>;
