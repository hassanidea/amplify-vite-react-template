import { defineBackend } from "@aws-amplify/backend";
import { auth } from "./auth/resource";
import { data } from "./data/resource";
import { getSubscriptionStatus } from "./functions/get-subscription-status/resource";
import { createBillingPortalSession } from "./functions/create-billing-portal-session/resource";

defineBackend({
  auth,
  data,
  getSubscriptionStatus,
  createBillingPortalSession,
});
