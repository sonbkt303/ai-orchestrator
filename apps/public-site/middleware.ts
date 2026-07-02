import { NextRequest, NextResponse } from 'next/server';
import { RESERVED_SLUGS } from '@clever-dent/shared-utils';

const DEFAULT_DOMAIN = 'local.cleverdent.ai';

function getBaseDomain(): string {
  return process.env.PUBLIC_BASE_DOMAIN ?? DEFAULT_DOMAIN;
}

export function middleware(request: NextRequest) {
  const baseDomain = getBaseDomain();
  const host = request.headers.get('host') ?? '';
  const hostname = host.split(':')[0];
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/maintenance')
  ) {
    return NextResponse.next();
  }

  if (hostname.endsWith(baseDomain)) {
    const subdomain = hostname.replace(`.${baseDomain}`, '');

    if (
      subdomain &&
      subdomain !== 'www' &&
      subdomain !== hostname &&
      !RESERVED_SLUGS.has(subdomain)
    ) {
      const url = request.nextUrl.clone();
      url.pathname = `/${subdomain}${pathname === '/' ? '' : pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
