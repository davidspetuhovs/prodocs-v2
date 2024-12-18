import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import Domain from "@/models/Domain";

/**
 * Adds a new custom domain to both Vercel and the application database
 * 
 * @route POST /api/domain
 * @access Private - Requires authentication
 * 
 * @example Request body:
 * {
 *   "domain": "docs.example.com"
 * }
 * 
 * @example Successful response:
 * {
 *   "_id": "507f1f77bcf86cd799439011",
 *   "domain": "docs.example.com",
 *   "status": "pending",
 *   "vercelConfig": {
 *     "name": "docs.example.com",
 *     "apexName": "example.com",
 *     "projectId": "prj_xxxxxxxxxxxx",
 *     "redirect": null,
 *     "redirectStatusCode": null,
 *     "gitBranch": null,
 *     "updatedAt": "2024-12-18T13:39:18.000Z",
 *     "createdAt": "2024-12-18T13:39:18.000Z"
 *   }
 * }
 */
export async function POST(req) {
  try {
    // Extract and validate domain from request body
    const body = await req.json();
    const { domain } = body;

    if (!domain) {
      return NextResponse.json(
        { error: "Domain is required" },
        { status: 400 }
      );
    }

    await connectMongo();

    // Ensure domain uniqueness
    const existingDomain = await Domain.findOne({ domain });
    if (existingDomain) {
      return NextResponse.json(
        { error: "Domain already exists" },
        { status: 400 }
      );
    }

    // Register domain with Vercel
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

    // Handle Vercel API errors
    if (vercelData.error) {
      return NextResponse.json(
        { error: vercelData.error.message },
        { status: 400 }
      );
    }

    // Store domain configuration in database
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

/**
 * Removes a custom domain from both Vercel and the application database
 * 
 * @route DELETE /api/domain?domain=docs.example.com
 * @access Private - Requires authentication
 * 
 * @example Query parameters:
 * ?domain=docs.example.com
 * 
 * @example Successful response:
 * {
 *   "message": "Domain successfully removed"
 * }
 */
export async function DELETE(req) {
  try {
    // Extract and validate domain from query parameters
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get("domain");

    if (!domain) {
      return NextResponse.json(
        { error: "Domain is required" },
        { status: 400 }
      );
    }

    await connectMongo();

    // Remove domain configuration from Vercel
    await fetch(
      `https://api.vercel.com/v9/projects/${process.env.VERCEL_PROJECT_ID}/domains/${domain}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${process.env.VERCEL_AUTH_TOKEN}`,
        },
      }
    );

    // Remove domain from application database
    await Domain.deleteOne({ domain });

    return NextResponse.json({ message: "Domain successfully removed" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}