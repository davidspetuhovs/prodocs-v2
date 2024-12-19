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
 * Checks if a path is a documentation route
 * This helps us determine if we should include company slug in the path
 */
function isDocumentationRoute(pathname) {
  // Add any other documentation-related paths here
  return pathname !== '/' && !pathname.startsWith('/dashboard');
}

/**
 * Middleware Handler
 * Processes incoming requests and applies routing logic based on domain
 * 
 * Behavior:
 * 1. Main domain (qalileo.com) - Normal routing
 * 2. Documentation routes - Direct path without company slug
 * 3. Other routes - Include company slug in path
 * 
 * @example
 * docs.printify.com/getting-started -> /getting-started
 * docs.printify.com/dashboard -> /printify/dashboard
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

  // For documentation routes, don't include company in path
  if (isDocumentationRoute(pathname)) {
    // Add company context via header for API routes
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-company-slug', companySlug);
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // For other routes (dashboard, etc), include company in path
  const newUrl = new URL(req.url);
  newUrl.pathname = pathname === '/' 
    ? `/${companySlug}` 
    : `/${companySlug}${pathname}`;
  
  return NextResponse.rewrite(newUrl);
}