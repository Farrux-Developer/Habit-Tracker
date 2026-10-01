import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";

  // If the host is a vercel.app domain, redirect to the GitHub releases page to download the app
  if (host.endsWith(".vercel.app")) {
    return NextResponse.redirect("https://github.com/Farrux-Developer/Habit-Tracker/releases/latest");
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip internal paths
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\..*).*)",
  ],
};
