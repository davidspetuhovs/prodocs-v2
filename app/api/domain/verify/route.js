import { NextResponse } from "next/server";

export async function GET(req) {
  const hostname = req.headers.get("host");
  const baseHostname = process.env.NODE_ENV === 'production' 
    ? 'qalileo.com'
    : process.env.NEXT_PUBLIC_BASE_URL?.replace(/https?:\/\//, "") || 'localhost:3000';

  // If it's the base hostname, don't do anything
  if (hostname === baseHostname || hostname === `www.${baseHostname}`) {
    return NextResponse.json({ configured: false });
  }

  try {
    // Check if this domain exists in our system
    const domainCheck = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/domain?domain=${hostname}`);
    const domains = await domainCheck.json();
    const domain = Array.isArray(domains) ? domains.find(d => d.domain === hostname) : null;

    return NextResponse.json({ configured: !!domain });
  } catch (error) {
    console.error("Error checking domain:", error);
    return NextResponse.json({ configured: false });
  }
}