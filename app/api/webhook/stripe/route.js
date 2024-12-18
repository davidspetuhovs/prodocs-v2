import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import connectMongo from "@/libs/mongoose";
import configFile from "@/config";
import User from "@/models/User";
import { findCheckoutSession } from "@/libs/stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

/**
 * Handles Stripe webhook events for subscription and payment processing
 * This endpoint receives events from Stripe and updates user access accordingly
 * 
 * @route POST /api/webhook/stripe
 * @access Private - Only accessible by Stripe
 * @security Requires Stripe signature verification
 * 
 * @example Webhook Event - Successful Subscription:
 * {
 *   "id": "evt_1234",
 *   "type": "checkout.session.completed",
 *   "data": {
 *     "object": {
 *       "id": "cs_test_1234",
 *       "client_reference_id": "user_1234",
 *       "customer": "cus_1234",
 *       "line_items": {
 *         "data": [{
 *           "price": {
 *             "id": "price_H5ggYwtDq4fbrJ"
 *           }
 *         }]
 *       }
 *     }
 *   }
 * }
 */
export async function POST(req) {
  await connectMongo();

  // Get request body and Stripe signature
  const body = await req.text();
  const signature = headers().get("stripe-signature");

  let data;
  let eventType;
  let event;

  // Verify webhook signature to ensure it's from Stripe
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error(`Webhook signature verification failed. ${err.message}`);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  data = event.data;
  eventType = event.type;

  try {
    switch (eventType) {
      case "checkout.session.completed": {
        /**
         * Handles successful checkout completion and subscription creation
         * 1. Retrieves checkout session details
         * 2. Gets or creates user based on customer information
         * 3. Updates user with subscription details and grants access
         */
        const session = await findCheckoutSession(data.object.id);

        const customerId = session?.customer;
        const priceId = session?.line_items?.data[0]?.price.id;
        const userId = data.object.client_reference_id;
        const plan = configFile.stripe.plans.find((p) => p.priceId === priceId);

        if (!plan) break;

        const customer = await stripe.customers.retrieve(customerId);

        let user;

        // User identification logic
        if (userId) {
          // Case 1: User ID provided in checkout session
          user = await User.findById(userId);
        } else if (customer.email) {
          // Case 2: Find or create user by customer email
          user = await User.findOne({ email: customer.email });

          if (!user) {
            user = await User.create({
              email: customer.email,
              name: customer.name,
            });

            await user.save();
          }
        } else {
          console.error("No user found");
          throw new Error("No user found");
        }

        // Update user subscription details and grant access
        user.priceId = priceId;
        user.customerId = customerId;
        user.hasAccess = true;
        await user.save();

        // Optional: Send welcome/confirmation email
        // try {
        //   await sendEmail({
        //     to: user.email,
        //     subject: "Welcome to Premium!",
        //     text: "Your subscription is now active..."
        //   });
        // } catch (e) {
        //   console.error("Email issue:" + e?.message);
        // }

        break;
      }

      case "checkout.session.expired": {
        /**
         * Handles expired checkout sessions (incomplete purchases)
         * Optional: Implement recovery email flow
         * Example:
         * 1. Get customer email from session
         * 2. Send reminder email with new checkout link
         */
        break;
      }

      case "customer.subscription.updated": {
        /**
         * Handles subscription updates (plan changes, cancellation requests)
         * Note: Actual cancellation is handled by customer.subscription.deleted
         * Optional: Update user metadata for UI feedback
         * Example: Add cancelAt date to user profile for "Canceling soon" badge
         */
        break;
      }

      case "customer.subscription.deleted": {
        /**
         * Handles subscription termination
         * 1. Retrieves subscription details
         * 2. Finds associated user
         * 3. Revokes product access
         */
        const subscription = await stripe.subscriptions.retrieve(
          data.object.id
        );
        const user = await User.findOne({ customerId: subscription.customer });

        // Revoke product access
        user.hasAccess = false;
        await user.save();

        break;
      }

      case "invoice.paid": {
        /**
         * Handles successful recurring payments
         * 1. Validates payment is for current subscription
         * 2. Ensures continued product access
         */
        const priceId = data.object.lines.data[0].price.id;
        const customerId = data.object.customer;

        const user = await User.findOne({ customerId });

        // Verify payment matches user's subscription plan
        if (user.priceId !== priceId) break;

        // Maintain product access
        user.hasAccess = true;
        await user.save();

        break;
      }

      case "invoice.payment_failed": {
        /**
         * Handles failed payments
         * Note: By default, we let Stripe handle retries (Smart Retries)
         * - Stripe automatically emails the customer
         * - Subscription cancellation is handled by customer.subscription.deleted
         * Optional: Implement custom retry logic or immediate access revocation
         */
        break;
      }

      default:
        // Unhandled event type
    }
  } catch (e) {
    console.error("stripe error: " + e.message + " | EVENT TYPE: " + eventType);
  }

  return NextResponse.json({});
}
