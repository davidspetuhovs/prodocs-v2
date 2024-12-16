import { NextResponse } from "next/server";

export const runtime = 'edge';

export async function GET(req) {
  const url = req.nextUrl;
  const hostname = req.headers.get("host");
  const baseHostname = process.env.NEXT_PUBLIC_BASE_URL.replace(/https?:\/\//, "");

  // If it's the base hostname, don't do anything
  if (hostname === baseHostname || hostname === `www.${baseHostname}`) {
    return NextResponse.json({ configured: false });
  }

  try {
    // Check if this domain exists in our system
    const domainCheck = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/domains/status?domain=${hostname}`);
    const domainData = await domainCheck.json();

    return NextResponse.json({ configured: domainData.configured });
  } catch (error) {
    console.error("Error checking domain:", error);
    return NextResponse.json({ configured: false });
  }
}