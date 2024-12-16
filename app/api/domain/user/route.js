import { NextResponse } from "next/server";
import { headers } from 'next/headers';
import connectMongo from "@/libs/mongoose";
import Domain from "@/models/Domain";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const headersList = headers();
    const hostname = headersList.get("host");
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'qalileo.com'
      : process.env.NEXT_PUBLIC_BASE_URL?.replace(/https?:\/\//, "") || 'localhost:3000';

    await connectMongo();

    // If it's a custom domain, find that specific domain
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

    // If no custom domain found or on main domain, find user's domain
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
