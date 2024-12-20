import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import Company from "@/models/Company";
import Documentation from "@/models/Documentation";

/**
 * Retrieves all published documentation for a company by its slug
 * 
 * @route GET /api/business/docs/[companySlug]
 * @param {string} companySlug - The slug identifier of the company
 * @access Public
 */
export async function GET(req, { params }) {
  console.log('Business API: Received request for company slug:', params.companySlug);
  
  try {
    console.log('Business API: Connecting to MongoDB...');
    await connectMongo();

    // Find company by slug
    const company = await Company.findOne({ slug: params.companySlug });
    if (!company) {
      console.log('Business API: Company not found for slug:', params.companySlug);
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    console.log('Business API: Found company:', company.name);

    // Find all published documentation for the company
    const docs = await Documentation.find(
      { 
        company: company._id,
        status: 'published'
      },
      { 
        title: 1,
        slug: 1,
        updatedAt: 1,
        _id: 0
      }
    ).sort({ updatedAt: -1 });

    console.log('Business API: Found documents:', docs.length);

    return NextResponse.json(docs);
  } catch (error) {
    console.error('Business API Error:', error);
    return NextResponse.json(
      { error: "Failed to fetch documentation" },
      { status: 500 }
    );
  }
}
