/**
 * Public API route for fetching documentation
 * This endpoint handles requests for public documentation based on company domains
 */
import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import Company from "@/models/Company";
import Documentation from "@/models/Documentation";
import Domain from "@/models/Domain";

/**
 * GET handler for public documentation
 * @param {Request} req - The incoming request object
 * @returns {NextResponse} JSON response with documentation data or error
 */
export async function GET(req) {
  try {
    // Connect to MongoDB database
    await connectMongo();
    
    // Get hostname from request headers for domain-based routing
    const hostname = req.headers.get("host");
    
    // Determine base URL based on environment
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'qalileo.com'
      : process.env.NEXT_PUBLIC_BASE_URL?.replace(/https?:\/\//, "") || 'localhost:3000';

    let company;
    
    // In development, get the first company for testing
    if (process.env.NODE_ENV === 'development' && hostname === baseUrl) {
      company = await Company.findOne();
    } else {
      // Production company identification logic:
      // 1. First check if it's a custom domain
      // 2. If not, check if it's a subdomain
      const domain = await Domain.findOne({ 
        domain: hostname,
        status: 'active'
      });

      if (domain) {
        company = await Company.findOne({ domain: domain._id });
      } else if (hostname.endsWith(`.${baseUrl}`)) {
        const slug = hostname.replace(`.${baseUrl}`, '');
        company = await Company.findOne({ slug });
      }
    }

    // Return 404 if company not found
    if (!company) {
      console.log('Company not found for hostname:', hostname);
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    console.log('Found company:', { id: company._id, name: company.name });

    // Fetch only published documentation for the company
    // Sorted by last update, returning essential fields only
    const docs = await Documentation.find({
      company: company._id,
      status: 'published'
    })
      .sort({ updatedAt: -1 })
      .select('id title slug updatedAt'); 

    console.log('Found docs:', docs);

    // Return the docs array directly
    return NextResponse.json(docs);
  } catch (error) {
    console.error('Error fetching public documentation:', error);
    return NextResponse.json(
      { error: "Failed to fetch documentation" },
      { status: 500 }
    );
  }
}
