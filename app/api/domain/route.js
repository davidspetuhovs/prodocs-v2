import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import Domain from "@/models/Domain";

export async function GET() {
  try {
    await connectMongo();
    const domains = await Domain.find().populate('user', 'email');
    return NextResponse.json(domains);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { domain } = body;

    if (!domain) {
      return NextResponse.json(
        { error: "Domain is required" },
        { status: 400 }
      );
    }

    await connectMongo();

    // Check if domain already exists
    const existingDomain = await Domain.findOne({ domain });
    if (existingDomain) {
      return NextResponse.json(
        { error: "Domain already exists" },
        { status: 400 }
      );
    }

    // Add domain to Vercel
    const vercelRes = await fetch(
      `https://api.vercel.com/v10/projects/${process.env.VERCEL_PROJECT_ID}/domains`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.VERCEL_AUTH_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: domain }),
      }
    );

    const vercelData = await vercelRes.json();

    if (vercelData.error) {
      return NextResponse.json(
        { error: vercelData.error.message },
        { status: 400 }
      );
    }

    // Create domain in database
    const newDomain = await Domain.create({
      domain,
      vercelConfig: vercelData,
      status: "pending",
      // user will be added when we implement authentication
    });

    return NextResponse.json(newDomain);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get("domain");

    if (!domain) {
      return NextResponse.json(
        { error: "Domain is required" },
        { status: 400 }
      );
    }

    await connectMongo();

    // Remove domain from Vercel
    await fetch(
      `https://api.vercel.com/v9/projects/${process.env.VERCEL_PROJECT_ID}/domains/${domain}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${process.env.VERCEL_AUTH_TOKEN}`,
        },
      }
    );

    // Remove domain from database
    await Domain.deleteOne({ domain });

    return NextResponse.json({ message: "Domain deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}