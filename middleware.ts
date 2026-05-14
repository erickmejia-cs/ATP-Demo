import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const locale =
    pathname === '/es' || pathname.startsWith('/es/') ? 'es' : 'en-us';
  const response = NextResponse.next();
  response.headers.set('x-locale', locale);
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
