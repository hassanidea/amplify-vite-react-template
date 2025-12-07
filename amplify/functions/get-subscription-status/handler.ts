import type { Handler } from "aws-lambda";
import Stripe from "stripe";

// Hardcoded test customer ID (from your Stripe dashboard)
const TEST_CUSTOMER_ID = "cus_TYXPwNYqMedQA2";

// Initialize Stripe with your secret key from environment variable
const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY || "sk_test_placeholder",
  {
    apiVersion: "2025-11-17.clover",
  }
);

export const handler: Handler = async (event, context) => {
  // Get user info if authenticated
  const userId = event.identity?.sub;

  if (!userId) {
    return {
      error: "Not authenticated",
    };
  }

  try {
    // Fetch subscriptions for the customer from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: TEST_CUSTOMER_ID,
      limit: 1, // Get the most recent subscription
    });

    const subscription = subscriptions.data[0];

    // If no subscription exists
    if (!subscription) {
      return {
        status: "No subscription",
        userId,
      };
    }

    // Extract relevant subscription data
    const sub = subscription as {
      status: string;
      items: { data: Array<{ price?: { nickname?: string } }> };
      current_period_end?: number;
      cancel_at_period_end?: boolean;
    };

    return {
      status: sub.status,
      planName: sub.items.data[0]?.price?.nickname || "Default Plan",
      currentPeriodEnd: sub.current_period_end
        ? new Date(sub.current_period_end * 1000).toISOString()
        : null,
      cancelAtPeriodEnd: sub.cancel_at_period_end ?? false,
      userId,
    };
  } catch (error) {
    console.error("Stripe error:", error);
    return {
      error: "Failed to fetch subscription status",
      message: (error as Error).message,
      userId,
    };
  }
};
