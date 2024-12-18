import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";

/**
 * Captures and processes lead information from the landing page
 * This endpoint is designed to handle lead generation, typically triggered by the <ButtonLead /> component
 * 
 * @route POST /api/lead
 * @access Public
 * 
 * @example Request body:
 * {
 *   "email": "potential-customer@example.com"
 * }
 * 
 * @example Successful response (200):
 * {}
 * 
 * @example Error response (400):
 * {
 *   "error": "Email is required"
 * }
 * 
 * Implementation Notes:
 * 1. Duplicate emails are silently accepted (return 200 OK)
 * 2. You can extend this endpoint to:
 *    - Send welcome emails using the sendEmail helper from /libs/resend
 *    - Store leads in a database (see commented code below)
 *    - Integrate with CRM systems
 *    - Trigger marketing automation workflows
 */
export async function POST(req) {
  await connectMongo();

  // Extract and validate email from request body
  const body = await req.json();

  if (!body.email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  try {
    // Example implementation for lead processing:
    // 1. Check for existing lead
    // const lead = await Lead.findOne({ email: body.email });
    
    // 2. If new lead, save to database
    // if (!lead) {
    //   await Lead.create({ email: body.email });
    // }
    
    // 3. Optional: Send welcome email
    // await sendEmail({
    //   to: body.email,
    //   subject: "Welcome to Our Product!",
    //   text: "Thank you for your interest..."
    // });

    return NextResponse.json({});
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
