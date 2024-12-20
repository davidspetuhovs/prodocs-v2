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
 * 2. Subdomains - Rewrite to include company in path
 * 
 * @example
 * docs.printify.com/getting-started -> /printify/getting-started
 * docs.printify.com/dashboard -> /printify/dashboard
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
  
  // Skip if already contains company slug
  if (pathname.startsWith(`/${companySlug}`)) {
    return NextResponse.next();
  }

  // Add company context via header for API routes
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-company-slug', companySlug);

  // Rewrite URL to include company slug
  const newUrl = new URL(req.url);
  newUrl.pathname = pathname === '/' 
    ? `/${companySlug}` 
    : `/${companySlug}${pathname}`;
  
  return NextResponse.rewrite(newUrl, {
    request: {
      headers: requestHeaders,
    },
  });
}