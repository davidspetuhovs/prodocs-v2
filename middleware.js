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
  
  // Get base URL from request if in production, otherwise use environment variable
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'qalileo.com'  // Hardcode production domain
    : process.env.NEXT_PUBLIC_BASE_URL?.replace(/https?:\/\//, "") || 'localhost:3000';

  // If it's the base hostname, don't do anything
  if (hostname === baseUrl || hostname === `www.${baseUrl}`) {
    return NextResponse.next();
  }

  try {
    // Use the request's protocol and host for the API call
    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const apiBase = process.env.NODE_ENV === 'production'
      ? `https://qalileo.com`
      : `${protocol}://${hostname}`;

    // Check if this domain exists in our system
    const domainCheck = await fetch(`${apiBase}/api/domain/verify?domain=${hostname}`);
    const domainData = await domainCheck.json();

    if (domainData.configured) {
      // Rewrite to the user's page
      return NextResponse.rewrite(new URL(`/dashboard`, req.url));
    }
  } catch (error) {
    console.error("Error checking domain:", error);
  }

  // If domain not found or error, continue as normal
  return NextResponse.next();
}