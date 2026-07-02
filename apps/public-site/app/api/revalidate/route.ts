import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-revalidate-secret');
  const expectedSecret = process.env.REVALIDATE_SECRET ?? 'dev-secret';

  if (secret !== expectedSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { slug?: string } = {};
  try {
    body = await request.json();
  } catch {
    // Phase 0: allow empty body
  }

  const slug = body.slug;
  if (slug) {
    revalidateTag(`site:${slug}`);
    console.log(`[revalidate] tag site:${slug}`);
  } else {
    console.log('[revalidate] stub called without slug');
  }

  return NextResponse.json({ revalidated: true, slug: slug ?? null });
}
