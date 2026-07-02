import { HomepageDraft, HomepageDraftSchema } from '@clever-dent/shared-contracts';
import sql from '../client';

interface DraftRow {
  clinic_id: string;
  slug: string;
  draft: HomepageDraft;
}

export async function getDraftByClinicId(clinicId: string): Promise<HomepageDraft | null> {
  const rows = await sql<DraftRow[]>`
    SELECT clinic_id, slug, draft
    FROM homepage_drafts
    WHERE clinic_id = ${clinicId}
    LIMIT 1
  `;

  if (rows.length === 0) {
    return null;
  }

  return HomepageDraftSchema.parse(rows[0].draft);
}

export async function getDraftBySlug(slug: string): Promise<HomepageDraft | null> {
  const rows = await sql<DraftRow[]>`
    SELECT clinic_id, slug, draft
    FROM homepage_drafts
    WHERE slug = ${slug}
    LIMIT 1
  `;

  if (rows.length === 0) {
    return null;
  }

  return HomepageDraftSchema.parse(rows[0].draft);
}

export async function upsertDraft(clinicId: string, slug: string, draft: HomepageDraft): Promise<void> {
  const parsed = HomepageDraftSchema.parse(draft);
  await sql`
    INSERT INTO homepage_drafts (clinic_id, slug, draft, updated_at)
    VALUES (${clinicId}, ${slug}, ${sql.json(parsed)}, now())
    ON CONFLICT (clinic_id)
    DO UPDATE SET slug = ${slug}, draft = ${sql.json(parsed)}, updated_at = now()
  `;
}

export async function updateDraft(clinicId: string, draft: HomepageDraft): Promise<void> {
  const parsed = HomepageDraftSchema.parse(draft);
  const result = await sql`
    UPDATE homepage_drafts
    SET draft = ${sql.json(parsed)}, slug = ${parsed.slug}, updated_at = now()
    WHERE clinic_id = ${clinicId}
  `;

  if (result.count === 0) {
    throw new Error(`Draft not found for clinic ${clinicId}`);
  }
}

export async function listAllDrafts(): Promise<HomepageDraft[]> {
  const rows = await sql<DraftRow[]>`
    SELECT clinic_id, slug, draft
    FROM homepage_drafts
    ORDER BY updated_at DESC
  `;

  return rows.map((row) => HomepageDraftSchema.parse(row.draft));
}
