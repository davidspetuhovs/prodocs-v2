import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import { createCustomerPortal } from "@/libs/stripe";
import User from "@/models/User";

/**
 * Creates a Stripe Customer Portal session for managing subscriptions
 * 
 * @route POST /api/stripe/create-portal
 * @access Private - Requires authentication and existing Stripe customer
 * 
 * @example Request body:
 * {
 *   "returnUrl": "https://example.com/account"  // URL to return to after leaving the portal
 * }
 * 
 * @example Successful response:
 * {
 *   "url": "https://billing.stripe.com/session/xxxxx"  // Stripe Customer Portal URL
 * }
 * 
 * @example Error - No billing account:
 * {
 *   "error": "You don't have a billing account yet. Make a purchase first."
 * }
 * 
 * @example Error - Missing return URL:
 * {
 *   "error": "Return URL is required"
 * }
 */
export async function POST(req) {
  // Verify user authentication
  const session = await getServerSession(authOptions);

  if (session) {
    try {
      await connectMongo();

      const body = await req.json();
      const { id } = session.user;

      // Get user and verify Stripe customer exists
      const user = await User.findById(id);

      if (!user?.customerId) {
        return NextResponse.json(
          {
            error:
              "You don't have a billing account yet. Make a purchase first.",
          },
          { status: 400 }
        );
      } else if (!body.returnUrl) {
        return NextResponse.json(
          { error: "Return URL is required" },
          { status: 400 }
        );
      }

      // Create Stripe Customer Portal session
      const stripePortalUrl = await createCustomerPortal({
        customerId: user.customerId,
        returnUrl: body.returnUrl,
      });

      return NextResponse.json({
        url: stripePortalUrl,
      });
    } catch (e) {
      console.error(e);
      return NextResponse.json({ error: e?.message }, { status: 500 });
    }
  } else {
    // Handle unauthenticated access
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
}
