import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import Domain from "@/models/Domain";

export const runtime = 'edge';

export async function GET(req) {
  const url = req.nextUrl;
  const hostname = url.searchParams.get("domain") || req.headers.get("host");
  const baseHostname = process.env.NEXT_PUBLIC_BASE_URL?.replace(/https?:\/\//, "") || 'qalileo.com';

  // If it's the base hostname, don't do anything
  if (hostname === baseHostname || hostname === `www.${baseHostname}`) {
    return NextResponse.json({ configured: false });
  }

  try {
    await connectMongo();
    
    // Check if this domain exists in our system
    const domain = await Domain.findOne({ 
      domain: hostname,
      status: 'active'
    });

    return NextResponse.json({ 
      configured: !!domain,
      verified: domain?.vercelConfig?.verified || false
    });
  } catch (error) {
    console.error("Error checking domain:", error);
    return NextResponse.json({ configured: false });
  }
}