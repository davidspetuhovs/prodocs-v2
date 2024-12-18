import { NextResponse } from "next/server";
import { headers } from 'next/headers';
import connectMongo from "@/libs/mongoose";
import Domain from "@/models/Domain";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";

/**
 * Retrieves domain information for the authenticated user based on the request context
 * Handles three scenarios:
 * 1. Custom domain access
 * 2. Main domain access
 * 3. User's associated domain lookup
 * 
 * @route GET /api/domain/user
 * @access Private - Requires authentication
 * 
 * @example Custom domain response:
 * {
 *   "email": "user@example.com",
 *   "domain": "docs.example.com",
 *   "isCustomDomain": true,
 *   "status": "active",
 *   "verified": true
 * }
 * 
 * @example Main domain response:
 * {
 *   "email": "user@example.com",
 *   "domain": "qalileo.com",
 *   "isCustomDomain": false,
 *   "status": null,
 *   "verified": false
 * }
 * 
 * @example User's domain response:
 * {
 *   "email": "user@example.com",
 *   "domain": "user-docs.example.com",
 *   "isCustomDomain": true,
 *   "status": "active",
 *   "verified": true
 * }
 */
export async function GET() {
  try {
    // Verify user authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get request hostname and determine base URL
    const headersList = headers();
    const hostname = headersList.get("host");
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'qalileo.com'
      : process.env.NEXT_PUBLIC_BASE_URL?.replace(/https?:\/\//, "") || 'localhost:3000';

    await connectMongo();

    // Scenario 1: Handle custom domain access
    if (hostname !== baseUrl && hostname !== `www.${baseUrl}`) {
      const domain = await Domain.findOne({ 
        domain: hostname,
        status: 'active'
      });

      if (domain) {
        return NextResponse.json({
          email: session.user.email,
          domain: domain.domain,
          isCustomDomain: true,
          status: domain.status,
          verified: domain.vercelConfig?.verified || false
        });
      }
    }

    // Scenario 2: Handle main domain access
    if (hostname === baseUrl || hostname === `www.${baseUrl}`) {
      return NextResponse.json({
        email: session.user.email,
        domain: 'qalileo.com',
        isCustomDomain: false,
        status: null,
        verified: false
      });
    }

    // Scenario 3: Look up user's associated domain
    const userDomain = await Domain.findOne({ 
      user: session.user.id,
      status: 'active'
    });

    return NextResponse.json({
      email: session.user.email,
      domain: userDomain ? userDomain.domain : 'qalileo.com',
      isCustomDomain: !!userDomain,
      status: userDomain?.status || null,
      verified: userDomain?.vercelConfig?.verified || false
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
