import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import Documentation from "@/models/Documentation";

/**
 * Retrieves a specific documentation by its slug - Public endpoint
 * 
 * @route GET /api/public/docs/[slug]
 * @param {string} slug - The unique identifier for the documentation
 * @access Public - No authentication required
 * 
 * @example URL:
 * GET /api/public/docs/getting-started
 * 
 * @example Successful response:
 * {
 *   "data": {
 *     "title": "Getting Started Guide",
 *     "slug": "getting-started",
 *     "sections": [
 *       {
 *         "type": "heading",
 *         "content": "Introduction"
 *       },
 *       {
 *         "type": "paragraph",
 *         "content": "Welcome to our product..."
 *       }
 *     ]
 *   }
 * }
 * 
 * @example Error response (404):
 * {
 *   "error": "Documentation not found"
 * }
 */
export async function GET(req, { params }) {
  console.log('Public API: Received request for slug:', params.slug);
  
  try {
    console.log('Public API: Connecting to MongoDB...');
    await connectMongo();

    // Find documentation by slug
    const { slug } = params;
    console.log('Public API: Searching for document with slug:', slug);
    
    const doc = await Documentation.findOne(
      { slug },
      { title: 1, slug: 1, sections: 1, _id: 0 }
    );

    console.log('Public API: Document found:', doc ? 'Yes' : 'No');

    if (!doc) {
      console.log('Public API: Document not found, returning 404');
      return NextResponse.json({ error: "Documentation not found" }, { status: 404 });
    }

    console.log('Public API: Successfully returning document');
    return NextResponse.json({ data: doc });
  } catch (error) {
    console.error('Public API Error:', error);
    return NextResponse.json(
      { error: "Failed to fetch documentation" },
      { status: 500 }
    );
  }
}