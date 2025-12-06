# Take-Home Project: Subscription Status Viewer

## Overview

Build a minimal full-stack application using AWS Amplify Gen 2 (React + TypeScript on the frontend, Amplify Functions on the backend) that displays a user's subscription status based on data retrieved from Stripe Billing.

This app should let a user sign in, view their current subscription state, and access Stripe's Billing Portal to manage their plan.

The goal is not pixel-perfect design. We're interested in how you structure a small full-stack app, interact with third-party APIs, and make good decisions under constrained time.

AI coding assistants are welcome and encouraged.

## Requirements

1. **Authentication**

   Implement basic authentication using Amplify Gen 2.
   - Email/password or any built-in provider is fine.
   - After signing in, the user should be redirected to a simple Dashboard page.
   - No need for sign-up confirmation flows; keep it minimal.

   **Purpose:** demonstrate how you handle protected routes and user context.

2. **Subscription Status Page**

   Create a Subscription page that displays:
   - Current subscription status (Active, Trialing, Past Due, Canceled, or "No subscription")
   - Plan name (if applicable)
   - Renewal period or renewal date (if applicable)
   - A loading state and a basic error state

   **Data source:**

   Call a backend Amplify Function that:
   - Looks up the Stripe Customer associated with the logged-in user.
     - For simplicity, assume a Stripe customer ID is stored in an environment variable or map a single hardcoded customer ID to the logged-in user.
   - Fetches subscription(s) for that customer via Stripe's API.
   - Returns structured JSON back to the frontend.

   **Purpose:** show how you build thin server functions, keep secrets server-side, and model Typescript responses.

3. **Billing Portal Link**

   Add a button on the Subscription page: "Manage Billing"

   When clicked, call a backend function to create a Stripe Billing Portal Session and redirect the user to it.

   **Purpose:** demonstrate Stripe API familiarity and redirect handling.

## Implementation Expectations

**Frontend**
- React + TypeScript using Amplify Gen 2 project structure
- Clearly separated pages and components
- Lightweight UI is perfectly fine (Chakra UI, MUI, Tailwind, or plain CSS)

**Backend**
- Amplify Gen 2 Functions written in TypeScript
- Stripe API calls made server-side only
- Environment variables handled via Amplify env configuration

**Security**
- Secrets (Stripe keys) must not leak to the frontend
- Only authenticated users should access subscription info

## Deliverables

Provide:

1. A GitHub repository with the project
2. Instructions to run the app locally, including:
   - Required env vars (mocked values allowed)
   - amplify sandbox or equivalent steps
3. A short README describing:
   - Architecture decisions
   - Assumptions
   - What you would improve with more time

## Stretch Goals (Totally Optional)

These are not required but let us see how you extend systems thoughtfully:

**Webhook handling**

Listen for Stripe webhook events (e.g., invoice.paid, customer.subscription.updated) and update subscription status in a simple local DB or in-memory cache.

**Store user → Stripe customer mapping**

Persist mapping via an Amplify Data model or a tiny JSON file.

**Add Amplitude event logging**

Track:
- User viewed Subscription page
- User clicked Manage Billing
- Subscription status changes

**UI polish**

Add a "Subscription Timeline" or "Billing History" table using Stripe invoice data.

## Evaluation Criteria

We'll evaluate submissions based on:

**Correctness & Completeness**

Does the app meet the core requirements with working Stripe + backend integration?

**Code Quality**

Readable, typed, tested (where appropriate), and modular.

**Architecture**

Reasonable boundaries between frontend and backend. Secrets handled correctly.

**Developer Experience**

Setup should be fast. Repo should be clean, well-structured, and understandable.

**Pragmatism**

Did the candidate make good tradeoffs given the small scope and timebox?
