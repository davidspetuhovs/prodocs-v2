import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import Company from "@/models/Company";
import User from "@/models/User";

/**
 * Creates a new company for a user
 * 
 * @route POST /api/company
 * @access Private - Requires authentication
 * 
 * @example Request body:
 * {
 *   "name": "Acme Corporation",
 *   "slug": "acme-corp"
 * }
 * 
 * @example Successful response (201):
 * {
 *   "data": {
 *     "_id": "507f1f77bcf86cd799439011",
 *     "name": "Acme Corporation",
 *     "slug": "acme-corp"
 *   }
 * }
 * 
 * @example Error response (400):
 * {
 *   "error": "Company name and slug are required"
 * }
 */
export async function POST(req) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { id } = session.user;
  const body = await req.json();
  const { name, slug } = body;

  // Validate required fields in request body
  if (!name || !slug) {
    return NextResponse.json({ error: "Company name and slug are required" }, { status: 400 });
  }

  try {
    await connectMongo();

    // Verify user exists in database
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Business logic validation: one company per user
    if (user.company) {
      return NextResponse.json(
        { error: "User already has a company" },
        { status: 400 }
      );
    }

    // Business logic validation: unique slug requirement
    const existingCompany = await Company.findOne({ slug });
    if (existingCompany) {
      return NextResponse.json(
        { error: "Company with this slug already exists" },
        { status: 400 }
      );
    }

    // Create and persist new company record
    const company = new Company({
      name,
      slug
    });

    await company.save();

    // Associate company with user and save
    user.company = company._id;
    await user.save();

    return NextResponse.json({ data: company }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

/**
 * Retrieves the authenticated user's company information
 * 
 * @route GET /api/company
 * @access Private - Requires authentication
 * 
 * @example Successful response with company:
 * {
 *   "data": {
 *     "_id": "507f1f77bcf86cd799439011",
 *     "name": "Acme Corporation",
 *     "slug": "acme-corp"
 *   }
 * }
 * 
 * @example Response when user has no company:
 * {
 *   "data": null
 * }
 * 
 * @example Error response (401):
 * {
 *   "error": "Not signed in"
 * }
 */
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  try {
    await connectMongo();
    // Fetch user and populate the company reference
    const user = await User.findById(session.user.id).populate('company');
    
    // Return null if user doesn't have a company
    if (!user?.company) {
      return NextResponse.json({ data: null });
    }

    return NextResponse.json({ data: user.company });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
