/**
 * Next.js Middleware Configuration
 * Handles routing logic for main domain, subdomains, and custom domains
 * 
 * Key Features:
 * 1. Path matching configuration
 * 2. Domain-based routing
 * 3. Internal path rewriting for custom domains
 */

import { NextResponse } from "next/server";

/**
 * Middleware Configuration
 * Defines which paths should be processed by the middleware
 */
export const config = {
  matcher: [
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
 * Processes incoming requests and applies routing logic based on domain
 * 
 * Behavior:
 * 1. Main domain (qalileo.com) - Normal routing
 * 2. Subdomains (docs.company.com, company.qalileo.com) - Rewrite to /[companySlug]
 * 3. Custom domains (company.com) - Rewrite to /[companySlug]
 * 
 * @example
 * docs.printify.com/getting-started -> /printify/getting-started
 * printify.qalileo.com/getting-started -> /printify/getting-started
 * printify.com/getting-started -> /printify/getting-started
 * 
 * @param {Request} req - Incoming request object
 * @returns {NextResponse} Response with appropriate routing
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
  
  // Skip rewrite if we're already on a company route
  if (pathname.startsWith(`/${companySlug}`)) {
    return NextResponse.next();
  }

  // For custom domains and subdomains:
  // Rewrite paths to include company slug
  const newUrl = new URL(req.url);
  newUrl.pathname = pathname === '/' 
    ? `/${companySlug}` 
    : `/${companySlug}${pathname}`;
  
  return NextResponse.rewrite(newUrl);
}