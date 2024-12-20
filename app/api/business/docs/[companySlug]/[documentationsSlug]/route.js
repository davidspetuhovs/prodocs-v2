import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import Documentation from "@/models/Documentation";
import Company from "@/models/Company";

/**
 * Retrieves a specific documentation by company slug and documentation slug
 * 
 * @route GET /api/business/docs/[companySlug]/[documentationsSlug]
 * @param {string} companySlug - The company's slug
 * @param {string} documentationsSlug - The documentation's slug
 * @access Public
 */
export async function GET(req, { params }) {
  console.log('Business API: Received request for company:', params.companySlug, 'doc:', params.documentationsSlug);
  
  try {
    await connectMongo();

    const { companySlug, documentationsSlug } = params;
    
    // First find the company by slug
    const company = await Company.findOne({ slug: companySlug });
    
    if (!company) {
      console.log('Business API: Company not found');
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // Then find the documentation using both company ID and slug
    const doc = await Documentation.findOne(
      { 
        company: company._id,
        slug: documentationsSlug,
        status: 'published'  // Only return published documents
      },
      { title: 1, slug: 1, sections: 1, _id: 0 }
    );

    if (!doc) {
      console.log('Business API: Documentation not found');
      return NextResponse.json({ error: "Documentation not found" }, { status: 404 });
    }

    console.log('Business API: Successfully returning document');
    return NextResponse.json({ data: doc });
  } catch (error) {
    console.error('Business API Error:', error);
    return NextResponse.json(
      { error: "Failed to fetch documentation" },
      { status: 500 }
    );
  }
}