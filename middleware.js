/**
 * Next.js Middleware Configuration
 * Handles routing logic for main domain, subdomains, and custom domains
 */

import { NextResponse } from "next/server";

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /static (public files)
     */
    "/((?!api|_next|static|[\\w-]+\\.\\w+).*)",
  ],
};

/**
 * Extracts company slug from hostname
 * 
 * @example
 * docs.printify.com -> printify
 * printify.qalileo.com -> printify
 * printify.com -> printify
 */
function extractCompanySlug(hostname, baseUrl) {
  // Handle docs subdomain (e.g., docs.printify.com)
  if (hostname.startsWith('docs.')) {
    return hostname.replace('docs.', '').split('.')[0];
  }
  
  // Handle qalileo subdomain (e.g., printify.qalileo.com)
  if (hostname.includes(baseUrl)) {
    return hostname.replace(`.${baseUrl}`, '');
  }
  
  // Handle custom domain (e.g., printify.com)
  return hostname.split('.')[0];
}

/**
 * Middleware Handler
 * 
 * Behavior:
 * 1. Main domain (qalileo.com) - Normal routing
 * 2. Subdomains - Clean URLs externally, internal rewrites for routing
 * 
 * @example
 * External: forgepad.qalileo.com/test
 * Internal: /forgepad/test (for Next.js routing)
 */
export async function middleware(req) {
  const hostname = req.headers.get("host");
  const url = new URL(req.url);
  const { pathname } = url;
  
  // Determine base URL based on environment
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'qalileo.com'
    : process.env.NEXT_PUBLIC_BASE_URL?.replace(/https?:\/\//, "") || 'localhost:3000';

  // Handle main domain requests normally
  if (hostname === baseUrl || hostname === `www.${baseUrl}`) {
    return NextResponse.next();
  }

  // Extract company slug from hostname
  const companySlug = extractCompanySlug(hostname, baseUrl);
  
  // Add company context via header for API routes
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-company-slug', companySlug);

  // Get path segments and remove company slug if it's the first segment
  const segments = pathname.split('/').filter(Boolean);
  if (segments[0] === companySlug) {
    // If URL contains company slug, redirect to clean URL
    const cleanUrl = new URL(req.url);
    cleanUrl.pathname = `/${segments.slice(1).join('/')}`;
    return NextResponse.redirect(cleanUrl);
  }

  // Internally rewrite to include company slug for Next.js routing
  const newUrl = new URL(req.url);
  newUrl.pathname = segments.length 
    ? `/${companySlug}/${segments.join('/')}` 
    : `/${companySlug}`;
  
  return NextResponse.rewrite(newUrl, {
    request: {
      headers: requestHeaders,
    },
  });
}