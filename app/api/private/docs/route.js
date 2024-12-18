import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import Documentation from "@/models/Documentation";
import { requireCompany } from "@/libs/check/auth-check";

/**
 * Get all documentation for the authenticated user's company
 * 
 * @route GET /api/private/docs
 * @access Private - Requires authentication and company association
 */
export async function GET() {
  try {
    const session = await requireCompany();
    await connectMongo();

    const docs = await Documentation.find({ 
      company: session.user.company,
    })
      .sort({ updatedAt: -1 })
      .select('_id title slug status updatedAt')
      .lean();

    return NextResponse.json(docs);
  } catch (error) {
    console.error('Error fetching private documentation:', error);
    return NextResponse.json(
      { error: "Failed to fetch documentation" },
      { status: 500 }
    );
  }
}

/**
 * Creates a new documentation for a company
 * 
 * @route POST /api/private/docs
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
 */
export async function POST(req) {
  try {
    const session = await requireCompany();
    await connectMongo();

    // Extract and validate required fields
    const body = await req.json();
    const { title, slug, sections, status } = body;

    // Validate required fields
    if (!title || !slug || !sections || sections.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Ensure unique slug within company scope
    const existingDoc = await Documentation.findOne({
      company: session.user.company,
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
      company: session.user.company,
      creator: session.user.id,
      status: status || 'draft'
    });

    console.log('Created document:', doc);
    return NextResponse.json(doc, { status: 201 });
  } catch (error) {
    console.error('Error creating documentation:', error);
    return NextResponse.json(
      { error: "Failed to create documentation" },
      { status: 500 }
    );
  }
}
