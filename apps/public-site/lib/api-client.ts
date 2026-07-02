import { PublishedSnapshot, PublishedSnapshotSchema } from '@clever-dent/shared-contracts';
import mockSnapshot from '@/fixtures/mock-snapshot.json';

const homepageApiUrl = process.env.HOMEPAGE_API_URL ?? 'http://localhost:3002';

export async function fetchPublishedSnapshot(slug: string): Promise<PublishedSnapshot | null> {
  try {
    const response = await fetch(`${homepageApiUrl}/v1/public/sites/${slug}`, {
      next: { tags: [`site:${slug}`] },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return PublishedSnapshotSchema.parse(data);
  } catch (error) {
    console.error('[api-client] fetch failed, using fallback fixture:', error);

    if (slug === mockSnapshot.slug) {
      return PublishedSnapshotSchema.parse(mockSnapshot);
    }

    return null;
  }
}
