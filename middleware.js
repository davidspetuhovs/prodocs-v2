/**
 * Next.js Middleware Configuration
 * Handles routing logic for main domain, subdomains, and custom domains
 * 
 * Key Features:
 * 1. Path matching configuration
 * 2. Domain-based routing
 * 3. Root path rewriting for documentation
 */

import { NextResponse } from "next/server";

/**
 * Middleware Configuration
 * Defines which paths should be processed by the middleware
 * 
 * Excluded Paths:
 * - /api/* - API routes
 * - /_next/* - Next.js internal routes
 * - /static/* - Static files in public directory
 * - Root files in public (e.g., favicon.ico, robots.txt)
 * 
 * @example Matched paths:
 * - /
 * - /docs
 * - /dashboard
 * 
 * @example Excluded paths:
 * - /api/auth
 * - /_next/static
 * - /favicon.ico
 */
export const config = {
  matcher: [
    "/((?!api|_next|static|[\\w-]+\\.\\w+).*)",
  ],
};

/**
 * Middleware Handler
 * Processes incoming requests and applies routing logic based on domain
 * 
 * Behavior:
 * 1. Main domain (qalileo.com) - Normal routing
 * 2. Subdomains (*.qalileo.com) - Redirects root to /docs
 * 3. Custom domains - Redirects root to /docs
 * 
 * @example
 * Main domain:
 * qalileo.com/ -> Shows landing page
 * qalileo.com/docs -> Shows docs page
 * 
 * Subdomain/Custom domain:
 * docs.example.com/ -> Redirects to docs.example.com/docs
 * docs.example.com/docs -> Shows docs page
 * 
 * @param {Request} req - Incoming request object
 * @returns {NextResponse} Response with appropriate routing
 */
export async function middleware(req) {
  const hostname = req.headers.get("host");
  const pathname = new URL(req.url).pathname;
  
  // Determine base URL based on environment
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'qalileo.com'
    : process.env.NEXT_PUBLIC_BASE_URL?.replace(/https?:\/\//, "") || 'localhost:3000';

  // Handle main domain requests normally
  if (hostname === baseUrl || hostname === `www.${baseUrl}`) {
    return NextResponse.next();
  }

  // Handle subdomain and custom domain root paths
  if (pathname === '/') {
    // Redirect root to /docs for better UX
    return NextResponse.rewrite(new URL('/docs', req.url));
  }

  // Allow all other paths to proceed normally
  return NextResponse.next();
}