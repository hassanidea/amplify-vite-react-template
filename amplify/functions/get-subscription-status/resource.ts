import { defineFunction, secret } from "@aws-amplify/backend";

export const getSubscriptionStatus = defineFunction({
  name: "get-subscription-status",
  entry: "./handler.ts",
  timeoutSeconds: 30,
  environment: {
    STRIPE_SECRET_KEY: secret("STRIPE_SECRET_KEY"),
  },
});
