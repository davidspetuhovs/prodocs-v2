/**
 * Next.js Middleware Configuration
 * Handles routing logic for main domain, subdomains, and custom domains
 * 
 * Key Features:
 * 1. Path matching configuration
 * 2. Domain-based routing
 * 3. Public path rewriting for custom domains
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
 * 2. Subdomains/Custom domains - Only allow access to /public paths
 * 
 * @example
 * Main domain:
 * qalileo.com/ -> Shows landing page
 * qalileo.com/docs -> Shows docs page
 * 
 * Subdomain/Custom domain:
 * docs.example.com/ -> Redirects to docs.example.com/public
 * docs.example.com/public/* -> Shows public content
 * docs.example.com/dashboard -> Redirects to /public
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

  // For custom domains and subdomains:
  // 1. Redirect root to /public
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/public', req.url));
  }

  // 2. Allow access only to /public paths
  if (!pathname.startsWith('/public')) {
    // Redirect any non-public paths to /public
    return NextResponse.redirect(new URL('/public', req.url));
  }

  // Allow /public paths to proceed normally
  return NextResponse.next();
}