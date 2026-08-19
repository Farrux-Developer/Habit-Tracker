import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';

  if (host.includes('vercel.app')) {
    const owner = process.env.NEXT_PUBLIC_VERCEL_GIT_REPO_OWNER || 'Farrux-Developer';
    const slug = process.env.NEXT_PUBLIC_VERCEL_GIT_REPO_SLUG || 'Habit-Tracker';
    return NextResponse.redirect(`https://github.com/${owner}/${slug}/releases`);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
