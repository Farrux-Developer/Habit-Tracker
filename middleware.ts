import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';

  if (host.endsWith('.vercel.app')) {
    const githubReleasesUrl = process.env.NEXT_PUBLIC_GITHUB_RELEASES_URL || 'https://github.com/Farrux-Developer/Habit-Tracker/releases/latest';
    return NextResponse.redirect(githubReleasesUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/:path*',
};
