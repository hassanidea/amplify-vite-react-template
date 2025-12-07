import type { Handler } from "aws-lambda";
import Stripe from "stripe";

// Hardcoded test customer ID (same as subscription status)
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
    // Create a billing portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: TEST_CUSTOMER_ID,
      return_url: process.env.RETURN_URL || "http://localhost:5173",
    });

    return {
      url: session.url,
      userId,
    };
  } catch (error) {
    console.error("Stripe billing portal error:", error);
    return {
      error: "Failed to create billing portal session",
      message: (error as Error).message,
      userId,
    };
  }
};
