import {
  HomepageDraftSchema,
  PublishRequestSchema,
  PublishedSnapshotSchema,
} from '@clever-dent/shared-contracts';
import { suggestSlugs, validateSlug } from '@clever-dent/shared-utils';
import config, { buildPublishedUrl } from '../../config';
import * as draftRepo from '../../db/repositories/draft.repository';
import * as slugRepo from '../../db/repositories/slug.repository';
import * as snapshotRepo from '../../db/repositories/snapshot.repository';
import { AppError } from '../../utils/app-error';

async function triggerRevalidate(slug: string): Promise<void> {
  try {
    const response = await fetch(`${config.publicSiteUrl}/api/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-revalidate-secret': config.revalidateSecret,
      },
      body: JSON.stringify({ slug }),
    });

    if (!response.ok) {
      console.warn('[publish] revalidate failed:', await response.text());
    }
  } catch (err) {
    console.warn('[publish] revalidate error:', err);
  }
}

export async function publish(slug: string) {
  const { slug: normalizedSlug } = PublishRequestSchema.parse({ slug });

  const draft = await draftRepo.getDraftBySlug(normalizedSlug);
  if (!draft) {
    throw new AppError('Draft not found for slug', 404);
  }

  if (!draft.clinicProfile) {
    throw new AppError('Draft is missing clinic profile', 422);
  }

  const takenSlugs = await slugRepo.getTakenSlugs();
  const otherTaken = new Set([...takenSlugs].filter((s) => s !== normalizedSlug));
  const validation = validateSlug(normalizedSlug, otherTaken);

  if (!validation.valid) {
    throw new AppError(validation.error ?? 'Invalid slug', 400);
  }

  const existingOwner = await slugRepo.getSlugOwner(normalizedSlug);
  if (existingOwner && existingOwner !== draft.clinicId) {
    const suggestions = suggestSlugs(
      {
        name: draft.clinicProfile.name,
        district: draft.clinicProfile.address.district,
        city: draft.clinicProfile.address.city,
      },
      takenSlugs,
    );
    throw new AppError('Slug is already taken by another clinic', 409, 'SLUG_CONFLICT', {
      suggestedSlugs: suggestions,
    });
  }

  const publishedAt = new Date().toISOString();
  const publishedUrl = buildPublishedUrl(normalizedSlug);

  const snapshot = PublishedSnapshotSchema.parse({
    clinicId: draft.clinicId,
    slug: normalizedSlug,
    publishedAt,
    siteEnabled: draft.siteEnabled,
    bookingEnabled: draft.bookingEnabled,
    templateId: draft.templateId,
    contentStyle: draft.contentStyle,
    seo: draft.seo,
    sections: draft.sections,
    clinicProfile: draft.clinicProfile,
  });

  await slugRepo.registerSlug(normalizedSlug, draft.clinicId);
  await snapshotRepo.insertSnapshot(draft.clinicId, normalizedSlug, snapshot);

  const updatedDraft = HomepageDraftSchema.parse({
    ...draft,
    status: 'published',
    slug: normalizedSlug,
    publishedUrl,
    publishedAt,
    draftUpdatedAt: publishedAt,
  });
  await draftRepo.updateDraft(draft.clinicId, updatedDraft);

  await triggerRevalidate(normalizedSlug);

  return { publishedUrl, publishedAt };
}

export function formatSlugConflict(err: AppError) {
  return {
    error: 'SLUG_CONFLICT' as const,
    message: err.message,
    suggestedSlugs: (err.details?.suggestedSlugs as string[]) ?? [],
  };
}
