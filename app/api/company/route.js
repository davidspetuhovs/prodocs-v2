import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import Company from "@/models/Company";
import User from "@/models/User";

export async function POST(req) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { id } = session.user;
  const body = await req.json();
  const { name, logo } = body;

  if (!name) {
    return NextResponse.json({ error: "Company name is required" }, { status: 400 });
  }

  try {
    await connectMongo();

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user already has a company
    if (user.company) {
      return NextResponse.json(
        { error: "User already has a company" },
        { status: 400 }
      );
    }

    // Create slug from company name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Check if company with this slug already exists
    const existingCompany = await Company.findOne({ slug });
    if (existingCompany) {
      return NextResponse.json(
        { error: "Company with this name already exists" },
        { status: 400 }
      );
    }

    // Create new company
    const company = new Company({
      name,
      slug,
      logo,
      owner: id
    });

    await company.save();

    // Update user with company reference
    user.company = company._id;
    await user.save();

    return NextResponse.json({ data: company }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  try {
    await connectMongo();
    const user = await User.findById(session.user.id).populate('company');
    
    if (!user?.company) {
      return NextResponse.json({ data: null });
    }

    return NextResponse.json({ data: user.company });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
