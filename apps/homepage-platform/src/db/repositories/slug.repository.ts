import sql from '../client';

interface SlugRow {
  slug: string;
  clinic_id: string;
}

export async function getAllSlugs(): Promise<Set<string>> {
  const rows = await sql<SlugRow[]>`SELECT slug FROM slug_registry`;
  return new Set(rows.map((row) => row.slug));
}

export async function getSlugOwner(slug: string): Promise<string | null> {
  const rows = await sql<SlugRow[]>`
    SELECT slug, clinic_id
    FROM slug_registry
    WHERE slug = ${slug}
    LIMIT 1
  `;

  return rows.length > 0 ? rows[0].clinic_id : null;
}

export async function registerSlug(slug: string, clinicId: string): Promise<void> {
  await sql`
    INSERT INTO slug_registry (slug, clinic_id)
    VALUES (${slug}, ${clinicId})
    ON CONFLICT (clinic_id)
    DO UPDATE SET slug = ${slug}
  `;
}

export async function getDraftSlugs(): Promise<Set<string>> {
  const rows = await sql<{ slug: string }[]>`
    SELECT slug FROM homepage_drafts
  `;
  return new Set(rows.map((row) => row.slug));
}

export async function getTakenSlugs(): Promise<Set<string>> {
  const [registrySlugs, draftSlugs] = await Promise.all([getAllSlugs(), getDraftSlugs()]);
  return new Set([...registrySlugs, ...draftSlugs]);
}

export async function getTakenSlugsExceptClinic(clinicId: string): Promise<Set<string>> {
  const taken = await getTakenSlugs();
  const rows = await sql<{ slug: string }[]>`
    SELECT slug FROM homepage_drafts WHERE clinic_id = ${clinicId}
    UNION
    SELECT slug FROM slug_registry WHERE clinic_id = ${clinicId}
  `;

  for (const row of rows) {
    taken.delete(row.slug);
  }

  return taken;
}
