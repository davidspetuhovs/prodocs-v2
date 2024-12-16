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
  const baseHostname = process.env.NEXT_PUBLIC_BASE_URL.replace(/https?:\/\//, "");

  // If it's the base hostname, don't do anything
  if (hostname === baseHostname || hostname === `www.${baseHostname}`) {
    return NextResponse.next();
  }

  try {
    // Check if this domain exists in our system
    const domainCheck = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/domain/verify?domain=${hostname}`);
    const domainData = await domainCheck.json();

    if (domainData.configured) {
      // Rewrite to the user's page
      return NextResponse.rewrite(new URL(`/dashboard`, req.url));
    }
  } catch (error) {
    console.error("Error checking domain:", error);
  }

  // If domain not found or error, continue as normal
  return NextResponse.next();
}