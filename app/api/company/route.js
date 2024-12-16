import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import Company from "@/models/Company";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Get all companies for the current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongo();
    const companies = await Company.find({
      "users.user": session.user.id
    }).populate('users.user', 'email name');

    return NextResponse.json(companies);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Create a new company
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, slug } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Name and slug are required" },
        { status: 400 }
      );
    }

    await connectMongo();

    // Check if company with slug already exists
    const existingCompany = await Company.findOne({ slug });
    if (existingCompany) {
      return NextResponse.json(
        { error: "Company with this slug already exists" },
        { status: 400 }
      );
    }

    // Create company with current user as owner
    const company = await Company.create({
      name,
      slug,
      users: [{
        user: session.user.id,
        role: "owner"
      }]
    });

    return NextResponse.json(company);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
