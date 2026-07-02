import { PublishedSnapshot, PublishedSnapshotSchema } from '@clever-dent/shared-contracts';
import sql from '../client';

interface SnapshotRow {
  snapshot: PublishedSnapshot;
}

export async function getLatestSnapshotBySlug(slug: string): Promise<PublishedSnapshot | null> {
  const rows = await sql<SnapshotRow[]>`
    SELECT snapshot
    FROM published_snapshots
    WHERE slug = ${slug}
    ORDER BY published_at DESC
    LIMIT 1
  `;

  if (rows.length === 0) {
    return null;
  }

  return PublishedSnapshotSchema.parse(rows[0].snapshot);
}

export async function insertSnapshot(
  clinicId: string,
  slug: string,
  snapshot: PublishedSnapshot,
): Promise<void> {
  const parsed = PublishedSnapshotSchema.parse(snapshot);
  await sql`
    INSERT INTO published_snapshots (clinic_id, slug, snapshot, published_at)
    VALUES (
      ${clinicId},
      ${slug},
      ${sql.json(parsed)},
      ${parsed.publishedAt}
    )
  `;
}
