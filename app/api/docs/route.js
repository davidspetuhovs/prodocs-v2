import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import Documentation from "@/models/Documentation";
import User from "@/models/User";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongo();
    const user = await User.findById(session.user.id).populate('company');
    
    if (!user.company) {
      return NextResponse.json({ error: "No company associated with user" }, { status: 400 });
    }

    const body = await req.json();
    const { title, slug, sections, status } = body;

    // Validate required fields
    if (!title || !slug || !sections || sections.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if slug already exists for this company
    const existingDoc = await Documentation.findOne({
      company: user.company._id,
      slug
    });

    if (existingDoc) {
      return NextResponse.json({ error: "A document with this slug already exists" }, { status: 400 });
    }

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

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongo();
    const user = await User.findById(session.user.id).populate('company');
    
    if (!user.company) {
      return NextResponse.json({ error: "No company associated with user" }, { status: 400 });
    }

    const docs = await Documentation.find({ company: user.company._id })
      .sort({ updatedAt: -1 })
      .select('title slug status updatedAt');

    return NextResponse.json({ data: docs });
  } catch (error) {
    console.error('Error fetching documentation:', error);
    return NextResponse.json(
      { error: "Failed to fetch documentation" },
      { status: 500 }
    );
  }
}
