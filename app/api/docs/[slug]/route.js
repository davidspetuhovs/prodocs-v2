import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import Documentation from "@/models/Documentation";
import User from "@/models/User";

/**
 * Retrieves a specific documentation by its slug for an authenticated user's company
 * 
 * @route GET /api/docs/[slug]
 * @param {string} slug - The unique identifier for the documentation
 * @access Private - Requires authentication and company association
 * 
 * @example URL:
 * GET /api/docs/getting-started
 * 
 * @example Successful response:
 * {
 *   "data": {
 *     "_id": "507f1f77bcf86cd799439011",
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
 *     ],
 *     "company": "507f1f77bcf86cd799439012",
 *     "creator": {
 *       "_id": "507f1f77bcf86cd799439013",
 *       "name": "John Doe",
 *       "email": "john@example.com",
 *       "image": "https://example.com/avatar.jpg"
 *     },
 *     "createdAt": "2024-12-18T13:39:18.000Z",
 *     "updatedAt": "2024-12-18T13:39:18.000Z"
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
    // Verify user authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user and their company information
    await connectMongo();
    const user = await User.findById(session.user.id).populate('company');
    
    // Ensure user has an associated company
    if (!user.company) {
      return NextResponse.json({ error: "No company associated with user" }, { status: 400 });
    }

    // Find documentation by slug within company scope
    const { slug } = params;
    const doc = await Documentation.findOne({
      company: user.company._id,
      slug
    }).populate('creator', 'name email image');

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
