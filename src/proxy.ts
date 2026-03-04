import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname.startsWith('/login');
  const isDashboard = pathname.startsWith('/dashboard') || pathname === '/';

  // Not logged in → redirect to login
  if (!session && isDashboard) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Logged in and hitting auth page → redirect to dashboard
  if (session && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
};
