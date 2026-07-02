import { z } from 'zod';

export const ContentStyleSchema = z.enum(['warm', 'professional', 'modern']);

export const HomepageStatusSchema = z.enum(['draft', 'published', 'unpublished']);

export const SectionKeySchema = z.enum([
  'hero',
  'services',
  'doctors',
  'appointment',
  'location',
  'footer',
]);

export const SeoSchema = z.object({
  metaTitle: z.string().nullable(),
  metaDescription: z.string().nullable(),
  ogImageUrl: z.string().url().nullable(),
});

export const HeroSectionSchema = z.object({
  title: z.string(),
  description: z.string(),
  imageUrl: z.string().url().optional(),
  aiGenerated: z.boolean().optional(),
});

export const ServiceCardSchema = z.object({
  serviceId: z.string().uuid(),
  shortDescription: z.string(),
  iconKey: z.string().optional(),
  name: z.string().optional(),
});

export const ServicesSectionSchema = z.object({
  sectionTitle: z.string(),
  cards: z.array(ServiceCardSchema),
});

export const DoctorProfileSchema = z.object({
  doctorId: z.string().uuid(),
  bio: z.string(),
  photoUrl: z.string().url().nullable().optional(),
  name: z.string().optional(),
  specialty: z.string().optional(),
});

export const DoctorsSectionSchema = z.object({
  profiles: z.array(DoctorProfileSchema),
});

export const AppointmentSectionSchema = z.object({
  title: z.string(),
  description: z.string(),
});

export const LocationSectionSchema = z.object({
  displayAddressText: z.string(),
});

export const SocialLinkSchema = z.object({
  platform: z.string(),
  url: z.string().url(),
});

export const FooterSectionSchema = z.object({
  contactOverride: z.string().nullable().optional(),
  hoursOverride: z.string().nullable().optional(),
  socialLinks: z.array(SocialLinkSchema).optional(),
});

export const ReviewsSectionSchema = z.object({
  sectionTitle: z.string().optional(),
  placeholder: z.boolean().optional(),
});

export const SectionsSchema = z.object({
  hero: HeroSectionSchema,
  services: ServicesSectionSchema,
  doctors: DoctorsSectionSchema,
  appointment: AppointmentSectionSchema,
  location: LocationSectionSchema,
  footer: FooterSectionSchema,
  reviews: ReviewsSectionSchema.optional(),
});

export const AddressSchema = z.object({
  line1: z.string(),
  city: z.string(),
  district: z.string().optional(),
  country: z.string(),
  postalCode: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const OperatingHoursSchema = z.object({
  dayOfWeek: z.string(),
  open: z.string().nullable(),
  close: z.string().nullable(),
  closed: z.boolean(),
});

export const ClinicProfileSchema = z.object({
  clinicId: z.string().uuid(),
  name: z.string(),
  phone: z.string(),
  address: AddressSchema,
  operatingHours: z.array(OperatingHoursSchema).optional(),
  locale: z.string().optional(),
  timezone: z.string().optional(),
});

export const HomepageDraftSchema = z.object({
  clinicId: z.string().uuid(),
  status: HomepageStatusSchema,
  slug: z.string(),
  publishedUrl: z.string().url().nullable(),
  templateId: z.string(),
  contentStyle: ContentStyleSchema,
  siteEnabled: z.boolean(),
  bookingEnabled: z.boolean(),
  displayServiceIds: z.array(z.string().uuid()).optional(),
  displayDoctorIds: z.array(z.string().uuid()).optional(),
  sections: SectionsSchema,
  seo: SeoSchema,
  draftUpdatedAt: z.string().datetime(),
  publishedAt: z.string().datetime().nullable(),
});

export const PublishedSnapshotSchema = z.object({
  clinicId: z.string().uuid(),
  slug: z.string(),
  publishedAt: z.string().datetime(),
  siteEnabled: z.boolean(),
  bookingEnabled: z.boolean(),
  templateId: z.string(),
  contentStyle: ContentStyleSchema,
  seo: SeoSchema,
  sections: SectionsSchema,
  clinicProfile: ClinicProfileSchema,
});

export type HeroSection = z.infer<typeof HeroSectionSchema>;
export type ServicesSection = z.infer<typeof ServicesSectionSchema>;
export type DoctorsSection = z.infer<typeof DoctorsSectionSchema>;
export type AppointmentSection = z.infer<typeof AppointmentSectionSchema>;
export type LocationSection = z.infer<typeof LocationSectionSchema>;
export type FooterSection = z.infer<typeof FooterSectionSchema>;
export type ReviewsSection = z.infer<typeof ReviewsSectionSchema>;
export type ContentStyle = z.infer<typeof ContentStyleSchema>;
export type HomepageStatus = z.infer<typeof HomepageStatusSchema>;
export type Seo = z.infer<typeof SeoSchema>;
export type Sections = z.infer<typeof SectionsSchema>;
export type ClinicProfile = z.infer<typeof ClinicProfileSchema>;
export type HomepageDraft = z.infer<typeof HomepageDraftSchema>;
export type PublishedSnapshot = z.infer<typeof PublishedSnapshotSchema>;
