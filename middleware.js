import { NextResponse } from "next/server";

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /static (inside /public)
     * 4. all root files inside /public (e.g. /favicon.ico)
     */
    "/((?!api|_next|static|[\\w-]+\\.\\w+).*)",
  ],
};

export async function middleware(req) {
  const hostname = req.headers.get("host");
  const pathname = new URL(req.url).pathname;
  
  // Get base URL and environment
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'qalileo.com'
    : process.env.NEXT_PUBLIC_BASE_URL?.replace(/https?:\/\//, "") || 'localhost:3000';

  // Check if it's the main domain
  if (hostname === baseUrl || hostname === `www.${baseUrl}`) {
    return NextResponse.next();
  }

  // If it's a subdomain or custom domain
  if (pathname === '/') {
    // Rewrite root path to /docs for both subdomains and custom domains
    return NextResponse.rewrite(new URL('/docs', req.url));
  }

  // For all other paths, continue normally
  return NextResponse.next();
}