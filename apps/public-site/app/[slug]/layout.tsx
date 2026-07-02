import type { Metadata } from 'next';
import { fetchPublishedSnapshot } from '@/lib/api-client';

interface SlugLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: SlugLayoutProps): Promise<Metadata> {
  const { slug } = await params;
  const snapshot = await fetchPublishedSnapshot(slug);

  if (!snapshot) {
    return { title: 'Site not found' };
  }

  return {
    title: snapshot.seo.metaTitle ?? snapshot.clinicProfile.name,
    description: snapshot.seo.metaDescription ?? undefined,
    openGraph: snapshot.seo.ogImageUrl
      ? { images: [{ url: snapshot.seo.ogImageUrl }] }
      : undefined,
  };
}

export default function SlugLayout({ children }: SlugLayoutProps) {
  return children;
}
