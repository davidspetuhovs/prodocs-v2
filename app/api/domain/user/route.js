import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import Domain from "@/models/Domain";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongo();

    // Find domain for current user
    const domain = await Domain.findOne({ 
      user: session.user.id,
      status: 'active'
    });

    // Return domain info or default to qalileo.com
    return NextResponse.json({
      email: session.user.email,
      domain: domain ? domain.domain : 'qalileo.com',
      isCustomDomain: !!domain,
      status: domain?.status || null,
      verified: domain?.vercelConfig?.verified || false
    });

  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
