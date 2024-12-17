import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import Documentation from "@/models/Documentation";
import User from "@/models/User";

export async function GET(req, { params }) {
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
