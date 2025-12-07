import { defineFunction, secret } from "@aws-amplify/backend";

export const createBillingPortalSession = defineFunction({
  name: "create-billing-portal-session",
  entry: "./handler.ts",
  timeoutSeconds: 30,
  environment: {
    STRIPE_SECRET_KEY: secret("STRIPE_SECRET_KEY"),
    RETURN_URL: "http://localhost:5173",
  },
});
