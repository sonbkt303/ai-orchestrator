import { NextRequest, NextResponse } from 'next/server';

const LOCAL_DOMAIN = 'local.cleverdent.ai';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') ?? '';
  const hostname = host.split(':')[0];
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/maintenance')
  ) {
    return NextResponse.next();
  }

  if (hostname.endsWith(LOCAL_DOMAIN)) {
    const subdomain = hostname.replace(`.${LOCAL_DOMAIN}`, '');

    if (subdomain && subdomain !== 'www' && subdomain !== hostname) {
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
