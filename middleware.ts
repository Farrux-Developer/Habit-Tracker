import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';

  if (host.includes('.vercel.app')) {
    const repoOwner = process.env.VERCEL_GIT_REPO_OWNER || process.env.NEXT_PUBLIC_VERCEL_GIT_REPO_OWNER || 'Farrux-Developer';
    const repoSlug = process.env.VERCEL_GIT_REPO_SLUG || process.env.NEXT_PUBLIC_VERCEL_GIT_REPO_SLUG || 'Habit-Tracker';
    const githubReleasesUrl = `https://github.com/${repoOwner}/${repoSlug}/releases/latest`;

    return NextResponse.redirect(githubReleasesUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/:path*',
};
