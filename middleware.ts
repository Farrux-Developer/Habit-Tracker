import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';

  if (host.includes('vercel.app')) {
    const repoOwner = process.env.VERCEL_GIT_REPO_OWNER || 'Farrux-Developer';
    const repoSlug = process.env.VERCEL_GIT_REPO_SLUG || 'Habit-Tracker';
    const githubReleasesUrl = `https://github.com/${repoOwner}/${repoSlug}/releases`;

    return NextResponse.redirect(githubReleasesUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
