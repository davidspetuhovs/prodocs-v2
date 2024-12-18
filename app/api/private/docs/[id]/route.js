import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import Documentation from "@/models/Documentation";
import { requireCompany } from "@/libs/check/auth-check";
import mongoose from "mongoose";

/**
 * Get a single documentation by ID for the authenticated user's company
 * 
 * @route GET /api/private/docs/[id]
 * @access Private - Requires authentication and company association
 */
export async function GET(req, { params }) {
  try {
    const session = await requireCompany();
    await connectMongo();

    const { id } = params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid document ID" },
        { status: 400 }
      );
    }

    const doc = await Documentation.findOne({
      _id: id,
      company: session.user.company,
    })
    .select('_id title slug status updatedAt sections creator')
    .populate('creator')
    .lean();

    if (!doc) {
      return NextResponse.json(
        { error: "Documentation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(doc);
  } catch (error) {
    console.error('Error fetching private documentation:', error);
    return NextResponse.json(
      { error: "Failed to fetch documentation" },
      { status: 500 }
    );
  }
}

/**
 * Update a documentation by ID
 * 
 * @route PUT /api/private/docs/[id]
 * @access Private - Requires authentication and company association
 */
export async function PUT(req, { params }) {
  try {
    const session = await requireCompany();
    await connectMongo();

    const { id } = params;
    const body = await req.json();

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid document ID" },
        { status: 400 }
      );
    }

    const doc = await Documentation.findOne({
      _id: id,
      company: session.user.company,
    });

    if (!doc) {
      return NextResponse.json(
        { error: "Documentation not found" },
        { status: 404 }
      );
    }

    // Update allowed fields
    const allowedUpdates = ['title', 'sections', 'status'];
    Object.keys(body).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        doc[key] = body[key];
      }
    });

    doc.updatedAt = new Date();
    await doc.save();

    return NextResponse.json({ data: doc });
  } catch (error) {
    console.error('Error updating documentation:', error);
    return NextResponse.json(
      { error: "Failed to update documentation" },
      { status: 500 }
    );
  }
}

/**
 * Delete a documentation by ID
 * 
 * @route DELETE /api/private/docs/[id]
 * @access Private - Requires authentication and company association
 */
export async function DELETE(req, { params }) {
  try {
    const session = await requireCompany();
    await connectMongo();

    const { id } = params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid document ID" },
        { status: 400 }
      );
    }

    const doc = await Documentation.findOneAndDelete({
      _id: id,
      company: session.user.company,
    });

    if (!doc) {
      return NextResponse.json(
        { error: "Documentation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      message: "Documentation deleted successfully",
      data: doc 
    });
  } catch (error) {
    console.error('Error deleting documentation:', error);
    return NextResponse.json(
      { error: "Failed to delete documentation" },
      { status: 500 }
    );
  }
}
