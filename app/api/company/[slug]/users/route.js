import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import Company from "@/models/Company";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Add user to company
export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = params;
    const body = await req.json();
    const { email, role } = body;

    if (!email || !role) {
      return NextResponse.json(
        { error: "Email and role are required" },
        { status: 400 }
      );
    }

    await connectMongo();

    // Find company and verify current user is admin/owner
    const company = await Company.findOne({ 
      slug,
      "users.user": session.user.id,
      "users.role": { $in: ["owner", "admin"] }
    });

    if (!company) {
      return NextResponse.json(
        { error: "Company not found or insufficient permissions" },
        { status: 404 }
      );
    }

    // Check if user is already in company
    const existingUser = company.users.find(u => u.user.toString() === session.user.id);
    if (existingUser) {
      return NextResponse.json(
        { error: "User is already in this company" },
        { status: 400 }
      );
    }

    // Add user to company
    company.users.push({
      user: session.user.id,
      role
    });

    await company.save();

    return NextResponse.json(company);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Remove user from company
export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = params;
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    await connectMongo();

    // Find company and verify current user is admin/owner
    const company = await Company.findOne({ 
      slug,
      "users.user": session.user.id,
      "users.role": { $in: ["owner", "admin"] }
    });

    if (!company) {
      return NextResponse.json(
        { error: "Company not found or insufficient permissions" },
        { status: 404 }
      );
    }

    // Cannot remove the last owner
    const owners = company.users.filter(u => u.role === "owner");
    if (owners.length === 1 && owners[0].user.toString() === userId) {
      return NextResponse.json(
        { error: "Cannot remove the last owner" },
        { status: 400 }
      );
    }

    // Remove user from company
    company.users = company.users.filter(u => u.user.toString() !== userId);
    await company.save();

    return NextResponse.json(company);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
