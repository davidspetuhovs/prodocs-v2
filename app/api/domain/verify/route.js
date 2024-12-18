import { NextResponse } from "next/server";

/**
 * Verifies if a domain is configured in the system
 * Used to check if a custom domain or subdomain is properly set up
 * 
 * @route GET /api/domain/verify
 * @access Public
 * 
 * @example Base domain request:
 * Host: qalileo.com
 * Response:
 * {
 *   "configured": false
 * }
 * 
 * @example Custom domain request:
 * Host: docs.example.com
 * Response:
 * {
 *   "configured": true  // if domain exists in system
 * }
 * 
 * @example Unconfigured domain request:
 * Host: unknown-domain.com
 * Response:
 * {
 *   "configured": false
 * }
 */
export async function GET(req) {
  // Get request hostname and determine base domain
  const hostname = req.headers.get("host");
  const baseHostname = process.env.NODE_ENV === 'production' 
    ? 'qalileo.com'
    : process.env.NEXT_PUBLIC_BASE_URL?.replace(/https?:\/\//, "") || 'localhost:3000';

  // Skip verification for base domain and its www subdomain
  if (hostname === baseHostname || hostname === `www.${baseHostname}`) {
    return NextResponse.json({ configured: false });
  }

  try {
    // Verify domain configuration in our system
    const domainCheck = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/domain?domain=${hostname}`);
    const domains = await domainCheck.json();
    const domain = Array.isArray(domains) ? domains.find(d => d.domain === hostname) : null;

    return NextResponse.json({ configured: !!domain });
  } catch (error) {
    console.error("Error checking domain:", error);
    return NextResponse.json({ configured: false });
  }
}