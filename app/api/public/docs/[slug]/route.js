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
  try {
    await connectMongo();

    // Find documentation by slug
    const { slug } = params;
    const doc = await Documentation.findOne(
      { slug },
      { title: 1, slug: 1, sections: 1, _id: 0 }
    );

    if (!doc) {
      return NextResponse.json({ error: "Documentation not found" }, { status: 404 });
    }

    return NextResponse.json({ data: doc });
  } catch (error) {
    console.error('Error fetching documentation:', error);
    return NextResponse.json(
      { error: "Failed to fetch documentation" },
      { status: 500 }
    );
  }
}