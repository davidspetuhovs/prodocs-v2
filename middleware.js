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

  // Get the protocol
  const protocol = req.headers.get("x-forwarded-proto") || "http";
  const apiBase = process.env.NODE_ENV === 'production'
    ? `https://${baseUrl}`
    : `${protocol}://${hostname}`;

  try {
    // Check if it's a subdomain of qalileo.com
    const isSubdomain = hostname.endsWith(`.${baseUrl}`);
    
    if (isSubdomain) {
      // If root path, rewrite to /docs
      if (pathname === '/') {
        return NextResponse.rewrite(new URL('/docs', req.url));
      }
      
      return NextResponse.next();
    }

    // For custom domains, verify the domain
    const domainCheck = await fetch(`${apiBase}/api/domain/verify?domain=${hostname}`);
    
    let domainData;
    try {
      domainData = await domainCheck.json();
    } catch (jsonError) {
      console.error("Error parsing domain verification response:", jsonError);
      return NextResponse.redirect(new URL(`https://${baseUrl}`));
    }

    if (domainData && domainData.configured) {
      // If root path, rewrite to /docs
      if (pathname === '/') {
        return NextResponse.rewrite(new URL('/docs', req.url));
      }
      
      return NextResponse.next();
    }

    // If domain not configured, redirect to main site
    return NextResponse.redirect(new URL(`https://${baseUrl}`));
  } catch (error) {
    console.error("Error in middleware:", error);
    // On error, redirect to main site
    return NextResponse.redirect(new URL(`https://${baseUrl}`));
  }
}