import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // For the assignment, we simulate auth by checking a 'user-role' cookie.
  // We default to 'publisher' if not set, to make testing easy.
  const role = request.cookies.get('user-role')?.value || 'publisher';

  // 1. Viewer cannot access /studio
  if (request.nextUrl.pathname.startsWith('/studio')) {
    if (role === 'viewer') {
      // Redirect viewers to the preview page instead
      return NextResponse.redirect(new URL('/preview/home', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/studio/:path*',
};
