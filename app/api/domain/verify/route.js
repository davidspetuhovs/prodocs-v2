import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import Domain from "@/models/Domain";

export const runtime = 'edge';

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
    await connectMongo();
    const domain = await Domain.findOne({ domain: hostname });
    return NextResponse.json({ configured: !!domain });
  } catch (error) {
    console.error("Error checking domain:", error);
    return NextResponse.json({ configured: false });
  }
}