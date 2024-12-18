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
 * Middleware Handler
 * Processes incoming requests and applies routing logic based on domain
 * 
 * Behavior:
 * 1. Main domain (qalileo.com) - Normal routing
 * 2. Subdomains/Custom domains - Internally rewrite paths to /public
 * 
 * @example
 * Main domain:
 * qalileo.com/ -> Shows landing page
 * qalileo.com/docs -> Shows docs page
 * 
 * Subdomain/Custom domain:
 * docs.example.com/ -> Internally rewrites to /public
 * docs.example.com/docs -> Internally rewrites to /public/docs
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
  // Internally rewrite all paths to their /public equivalent
  const newUrl = new URL(req.url);
  newUrl.pathname = pathname === '/' ? '/public' : `/public${pathname}`;
  
  return NextResponse.rewrite(newUrl);
}