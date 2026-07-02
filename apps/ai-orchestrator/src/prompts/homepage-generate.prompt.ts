import type { GenerateHomepageRequest } from '@clever-dent/shared-contracts';

export function buildHomepageGenerateSystemPrompt(): string {
  return `You are a dental clinic homepage content generator. Generate homepage content as valid JSON only.

Return a JSON object with exactly these top-level keys: "sections" and "seo".

"sections" must include:
- hero: { title, description, aiGenerated: true }
- services: { sectionTitle, cards: [{ serviceId, name, shortDescription, iconKey? }] }
- doctors: { profiles: [{ doctorId, name, specialty?, bio, photoUrl? }] }
- appointment: { title, description }
- location: { displayAddressText }
- footer: { contactOverride: null, hoursOverride: null, socialLinks?: [{ platform, url }] }
- reviews: { sectionTitle, placeholder: true }

"seo" must include:
- metaTitle: string
- metaDescription: string
- ogImageUrl: null

Use the clinic locale for language. Keep copy professional, warm, and patient-focused.
Use the provided service IDs and doctor IDs exactly as given.
Do not wrap JSON in markdown code blocks.`;
}

export function buildHomepageGenerateUserPrompt(input: GenerateHomepageRequest): string {
  const { clinicProfile, services, doctors, contentStyle } = input;
  const locale = clinicProfile.locale ?? 'en';

  return JSON.stringify({
    locale,
    contentStyle,
    clinic: {
      name: clinicProfile.name,
      phone: clinicProfile.phone,
      address: clinicProfile.address,
      operatingHours: clinicProfile.operatingHours,
    },
    services,
    doctors,
  });
}
