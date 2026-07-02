import {
  GenerateHomepageRequest,
  GenerateHomepageRequestSchema,
  GenerateHomepageResponseSchema,
  HomepageDraft,
  HomepageDraftSchema,
} from '@clever-dent/shared-contracts';
import { normalizeSlugInput, suggestSlugs, validateSlug } from '@clever-dent/shared-utils';
import config, { buildPublishedUrl } from '../../config';
import * as draftRepo from '../../db/repositories/draft.repository';
import * as slugRepo from '../../db/repositories/slug.repository';
import { AppError } from '../../utils/app-error';

async function callAiGenerate(input: GenerateHomepageRequest) {
  const response = await fetch(`${config.aiOrchestratorUrl}/ai/homepage/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new AppError(`AI generation failed: ${body}`, 502);
  }

  const data = await response.json();
  return GenerateHomepageResponseSchema.parse(data);
}

async function resolveSlug(
  input: GenerateHomepageRequest,
  takenSlugs: Set<string>,
): Promise<{ slug: string; suggestedSlugs?: string[] }> {
  const clinic = input.clinicProfile;
  const suggestions = suggestSlugs(
    {
      name: clinic.name,
      district: clinic.address.district,
      city: clinic.address.city,
    },
    takenSlugs,
  );

  if (input.slug) {
    const normalized = normalizeSlugInput(input.slug);
    const validation = validateSlug(normalized, takenSlugs);
    if (validation.valid) {
      return { slug: normalized };
    }

    if (suggestions.length === 0) {
      throw new AppError(validation.error ?? 'Invalid slug', 400);
    }

    return { slug: suggestions[0], suggestedSlugs: suggestions };
  }

  if (suggestions.length === 0) {
    throw new AppError('Could not suggest a valid slug', 400);
  }

  return { slug: suggestions[0], suggestedSlugs: suggestions.slice(1) };
}

export async function generateAndSaveDraft(rawInput: unknown): Promise<{
  draft: HomepageDraft;
  suggestedSlugs?: string[];
}> {
  const input = GenerateHomepageRequestSchema.parse(rawInput);
  const clinicId = input.clinicProfile.clinicId;
  const takenSlugs = await slugRepo.getTakenSlugsExceptClinic(clinicId);
  const existingOwner = input.slug ? await slugRepo.getSlugOwner(normalizeSlugInput(input.slug)) : null;

  if (existingOwner && existingOwner !== clinicId) {
    const suggestions = suggestSlugs(
      {
        name: input.clinicProfile.name,
        district: input.clinicProfile.address.district,
        city: input.clinicProfile.address.city,
      },
      takenSlugs,
    );
    throw new AppError('Slug is already taken by another clinic', 409, 'SLUG_CONFLICT', {
      suggestedSlugs: suggestions,
    });
  }

  const aiResult = await callAiGenerate(input);
  const { slug, suggestedSlugs } = await resolveSlug(input, takenSlugs);
  const now = new Date().toISOString();

  const draft: HomepageDraft = HomepageDraftSchema.parse({
    clinicId: input.clinicProfile.clinicId,
    status: 'draft',
    slug,
    publishedUrl: null,
    templateId: input.templateId,
    contentStyle: input.contentStyle,
    siteEnabled: input.siteEnabled,
    bookingEnabled: input.bookingEnabled,
    displayServiceIds: input.services.map((s) => s.serviceId),
    displayDoctorIds: input.doctors.map((d) => d.doctorId),
    sections: aiResult.sections,
    seo: aiResult.seo,
    clinicProfile: input.clinicProfile,
    draftUpdatedAt: now,
    publishedAt: null,
  });

  await draftRepo.upsertDraft(input.clinicProfile.clinicId, slug, draft);

  return { draft, suggestedSlugs };
}

export async function getDraft(clinicId: string): Promise<HomepageDraft | null> {
  return draftRepo.getDraftByClinicId(clinicId);
}

export async function patchDraft(clinicId: string, patch: Partial<HomepageDraft>): Promise<HomepageDraft> {
  const existing = await draftRepo.getDraftByClinicId(clinicId);
  if (!existing) {
    throw new AppError('Draft not found', 404);
  }

  const merged = HomepageDraftSchema.parse({
    ...existing,
    ...patch,
    clinicId,
    draftUpdatedAt: new Date().toISOString(),
  });

  if (merged.slug !== existing.slug) {
    const takenSlugs = await slugRepo.getTakenSlugsExceptClinic(clinicId);
    const validation = validateSlug(merged.slug, takenSlugs);
    if (!validation.valid) {
      throw new AppError(validation.error ?? 'Invalid slug', 400);
    }
  }

  await draftRepo.updateDraft(clinicId, merged);
  return merged;
}

export async function suggestSlugNames(name: string, district?: string, city?: string): Promise<string[]> {
  const takenSlugs = await slugRepo.getTakenSlugs();
  return suggestSlugs({ name, district, city }, takenSlugs);
}

export { buildPublishedUrl };
