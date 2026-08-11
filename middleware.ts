import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host');

  if (host && host.includes('vercel.app')) {
    return NextResponse.redirect('https://github.com/Farrux-Developer/Habit-Tracker/releases');
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/:path*',
};
