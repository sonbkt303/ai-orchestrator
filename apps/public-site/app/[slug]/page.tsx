import { notFound, redirect } from 'next/navigation';
import { fetchPublishedSnapshot } from '@/lib/api-client';
import { SitePage } from '@/components/SitePage';

interface SlugPageProps {
  params: Promise<{ slug: string }>;
}

export default async function SlugPage({ params }: SlugPageProps) {
  const { slug } = await params;
  const snapshot = await fetchPublishedSnapshot(slug);

  if (!snapshot) {
    notFound();
  }

  if (!snapshot.siteEnabled) {
    redirect('/maintenance');
  }

  return <SitePage snapshot={snapshot} />;
}
