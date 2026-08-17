import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/session';

// Next.js 16 renamed `middleware.ts` to `proxy.ts` (same mechanism, new name).
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isCrmApiRoute = pathname.startsWith('/api/crm');
  const isProtectedCrmPage = pathname.startsWith('/crm') && pathname !== '/crm/login';

  if (!isCrmApiRoute && !isProtectedCrmPage) {
    return NextResponse.next();
  }

  const session = await getSessionFromRequest(request);
  if (session) {
    return NextResponse.next();
  }

  if (isCrmApiRoute) {
    return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
  }

  const loginUrl = new URL('/crm/login', request.url);
  loginUrl.searchParams.set('next', pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/crm/:path*', '/api/crm/:path*'],
};
