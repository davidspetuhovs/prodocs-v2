import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import Documentation from "@/models/Documentation";
import User from "@/models/User";
import Company from "@/models/Company";

/**
 * Creates a new documentation for a company
 * 
 * @route POST /api/docs
 * @access Private - Requires authentication and company association
 * 
 * @example Request body:
 * {
 *   "title": "Getting Started Guide",
 *   "slug": "getting-started",
 *   "sections": [
 *     {
 *       "type": "heading",
 *       "content": "Introduction"
 *     },
 *     {
 *       "type": "paragraph",
 *       "content": "Welcome to our product documentation..."
 *     }
 *   ],
 *   "status": "draft"  // Optional, defaults to 'draft'
 * }
 * 
 * @example Successful response (201):
 * {
 *   "data": {
 *     "_id": "507f1f77bcf86cd799439011",
 *     "title": "Getting Started Guide",
 *     "slug": "getting-started",
 *     "sections": [...],
 *     "company": "507f1f77bcf86cd799439012",
 *     "creator": "507f1f77bcf86cd799439013",
 *     "status": "draft",
 *     "createdAt": "2024-12-18T13:39:18.000Z",
 *     "updatedAt": "2024-12-18T13:39:18.000Z"
 *   }
 * }
 */
export async function POST(req) {
  try {
    // Verify user authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user and their company information
    await connectMongo();
    const user = await User.findById(session.user.id).populate('company');
    
    // Verify user has an associated company
    if (!user.company) {
      return NextResponse.json({ error: "No company associated with user" }, { status: 400 });
    }

    // Extract and validate required fields
    const body = await req.json();
    const { title, slug, sections, status } = body;

    // Validate required fields
    if (!title || !slug || !sections || sections.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Ensure unique slug within company scope
    const existingDoc = await Documentation.findOne({
      company: user.company._id,
      slug
    });

    if (existingDoc) {
      return NextResponse.json({ error: "A document with this slug already exists" }, { status: 400 });
    }

    // Create new documentation
    const doc = await Documentation.create({
      title,
      slug,
      sections,
      company: user.company._id,
      creator: user._id,
      status: status || 'draft'
    });

    return NextResponse.json({ data: doc }, { status: 201 });
  } catch (error) {
    console.error('Error creating documentation:', error);
    return NextResponse.json(
      { error: "Failed to create documentation" },
      { status: 500 }
    );
  }
}

/**
 * Retrieves documentation based on the request context
 * 
 * @route GET /api/docs
 * @access Mixed - Public for published docs via subdomain/custom domain, Private for draft docs
 * 
 * @example Response for authenticated company user:
 * {
 *   "data": [
 *     {
 *       "_id": "507f1f77bcf86cd799439011",
 *       "title": "Getting Started Guide",
 *       "slug": "getting-started",
 *       "status": "published",
 *       "updatedAt": "2024-12-18T13:39:18.000Z"
 *     }
 *   ]
 * }
 * 
 * @example Response for public access (via subdomain):
 * {
 *   "data": [
 *     {
 *       "title": "API Reference",
 *       "slug": "api-reference",
 *       "sections": [...],
 *       "updatedAt": "2024-12-18T13:39:18.000Z"
 *     }
 *   ]
 * }
 */
export async function GET(req) {
  try {
    await connectMongo();
    const session = await getServerSession(authOptions);
    
    // Determine the access context based on hostname
    const hostname = req.headers.get("host");
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'qalileo.com'
      : process.env.NEXT_PUBLIC_BASE_URL?.replace(/https?:\/\//, "") || 'localhost:3000';

    // Handle authenticated user access on main domain
    if (session && (hostname === baseUrl || hostname === `www.${baseUrl}`)) {
      const user = await User.findById(session.user.id).populate('company');
      
      if (!user.company) {
        return NextResponse.json({ error: "No company associated with user" }, { status: 400 });
      }

      // Return all docs for the company, sorted by last update
      const docs = await Documentation.find({ 
        company: user.company._id,
      })
        .sort({ updatedAt: -1 })
        .select('title slug status updatedAt');

      return NextResponse.json({ data: docs });
    }

    // Handle public access via subdomain or custom domain
    let company;
    
    // Extract company from subdomain
    if (hostname.endsWith(`.${baseUrl}`)) {
      const slug = hostname.replace(`.${baseUrl}`, '');
      company = await Company.findOne({ slug });
    } else {
      // Extract company from custom domain
      company = await Company.findOne({ domain: hostname });
    }

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // Return only published docs for public access
    const docs = await Documentation.find({
      company: company._id,
      status: 'published'
    })
      .sort({ updatedAt: -1 })
      .select('title slug sections updatedAt');

    return NextResponse.json({ data: docs });
  } catch (error) {
    console.error('Error fetching documentation:', error);
    return NextResponse.json(
      { error: "Failed to fetch documentation" },
      { status: 500 }
    );
  }
}
