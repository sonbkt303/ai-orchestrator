import {
  HomepageDraft,
  PublishedSnapshot,
  PublishedSnapshotSchema,
} from './homepage.schema';

export function draftToSnapshot(draft: HomepageDraft): PublishedSnapshot {
  if (!draft.clinicProfile) {
    throw new Error('Draft is missing clinicProfile');
  }

  return PublishedSnapshotSchema.parse({
    clinicId: draft.clinicId,
    slug: draft.slug,
    publishedAt: draft.publishedAt ?? draft.draftUpdatedAt,
    siteEnabled: draft.siteEnabled,
    bookingEnabled: draft.bookingEnabled,
    templateId: draft.templateId,
    contentStyle: draft.contentStyle,
    seo: draft.seo,
    sections: draft.sections,
    clinicProfile: draft.clinicProfile,
  });
}
