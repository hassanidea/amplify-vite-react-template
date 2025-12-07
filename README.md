# Subscription Status Viewer

A minimal full-stack application built with AWS Amplify Gen 2, React, TypeScript, and Stripe API that displays user subscription status and provides access to Stripe's Billing Portal.

## Overview

This application demonstrates:
- AWS Amplify Gen 2 authentication with Cognito
- Server-side Stripe API integration via Lambda functions
- Type-safe GraphQL API with custom resolvers
- Secure secret management
- Clean separation between frontend and backend

## Features

- User authentication with email/password
- Real-time subscription status display (Active, Trialing, Past Due, Canceled, or No subscription)
- Plan details and renewal information
- One-click access to Stripe Billing Portal
- Loading and error states
- Secure server-side Stripe API calls

## Tech Stack

**Frontend:**
- React 18
- TypeScript
- Vite
- AWS Amplify UI Components
- Inline CSS (lightweight, no external UI library)

**Backend:**
- AWS Amplify Gen 2
- AWS Lambda (TypeScript)
- AWS AppSync (GraphQL)
- AWS Cognito (Authentication)
- Stripe API v20

## Project Structure

```
amplify-vite-react-template/
├── amplify/
│   ├── backend.ts                                    # Amplify backend configuration
│   ├── data/
│   │   └── resource.ts                              # GraphQL schema with custom types
│   └── functions/
│       ├── get-subscription-status/
│       │   ├── handler.ts                           # Fetches subscription from Stripe
│       │   ├── resource.ts                          # Lambda configuration
│       │   └── package.json                         # Stripe dependency
│       └── create-billing-portal-session/
│           ├── handler.ts                           # Creates Stripe billing portal session
│           ├── resource.ts                          # Lambda configuration
│           └── package.json                         # Stripe dependency
├── src/
│   ├── App.tsx                                      # Main application component
│   └── main.tsx                                     # Application entry point
└── package.json                                     # Frontend dependencies
```

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- AWS Account
- Stripe Account (test mode)

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd amplify-vite-react-template
```

### 2. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install Lambda function dependencies
cd amplify/functions/get-subscription-status
npm install

cd ../create-billing-portal-session
npm install

cd ../../..
```

### 3. Configure Environment Variables

You need to set up your Stripe secret key as an Amplify secret:

```bash
npx ampx sandbox secret set STRIPE_SECRET_KEY
```

When prompted, enter your Stripe test secret key (starts with `sk_test_`).

**Required Environment Variables:**
- `STRIPE_SECRET_KEY`: Your Stripe secret key from the [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)

### 4. Update Customer ID (Optional)

For testing, update the hardcoded customer ID in both Lambda functions:

**File:** `amplify/functions/get-subscription-status/handler.ts`
```typescript
const TEST_CUSTOMER_ID = "cus_YOUR_CUSTOMER_ID";  // Line 5
```

**File:** `amplify/functions/create-billing-portal-session/handler.ts`
```typescript
const TEST_CUSTOMER_ID = "cus_YOUR_CUSTOMER_ID";  // Line 5
```

You can find test customer IDs in your [Stripe Dashboard](https://dashboard.stripe.com/test/customers).

### 5. Start the Development Environment

```bash
# Start Amplify sandbox (this deploys Lambda functions and sets up AppSync)
npx ampx sandbox

# In a separate terminal, start the React dev server
npm run dev
```

The sandbox will:
- Deploy Lambda functions to AWS
- Set up AppSync GraphQL API
- Configure Cognito user pool
- Provide a local development endpoint

### 6. Create a Test User

On first run, you'll need to create a user account:

1. Open the app in your browser (usually `http://localhost:5173`)
2. Click "Sign In"
3. Enter any email and password (no confirmation required in sandbox mode)
4. The system will create the user automatically

### 7. Access the Application

Once signed in, you'll see:
- Your subscription status
- Plan details
- Renewal date
- "Manage Billing" button to access Stripe's portal

## Architecture Decisions

### 1. Single-Page Application

**Decision:** Built as a single-page app without React Router.

**Rationale:** The requirements specify a simple subscription viewer, not multiple pages. Adding routing would be over-engineering for this scope.

### 2. Custom GraphQL Types Instead of Generic JSON

**Decision:** Used `a.customType()` for structured responses instead of `a.json()`.

**Rationale:**
- Provides type safety from backend to frontend
- Better developer experience with autocomplete
- Clear API contract
- Easier to validate and test

### 3. Lambda Functions as Separate Node.js Projects

**Decision:** Each Lambda function has its own `package.json` with Stripe as a dependency.

**Rationale:**
- Follows Amplify Gen 2 best practices
- Allows independent versioning of dependencies
- Smaller deployment packages per function
- Clear separation of concerns

### 4. Stripe Client Initialization Outside Handler

**Decision:** Stripe client instantiated at module level, not inside the handler.

**Rationale:**
- Lambda containers reuse connections across invocations
- Reduces cold start time
- Follows AWS Lambda best practices
- Better performance for repeated requests

### 5. Hardcoded Customer ID

**Decision:** Used a single hardcoded test customer ID instead of database mapping.

**Rationale:**
- Explicitly allowed in requirements for simplicity
- Sufficient for demonstrating Stripe integration
- Avoids complexity of user-customer mapping for this prototype
- Could be easily extended to database lookup in production

### 6. Inline CSS Instead of UI Library

**Decision:** Used inline styles instead of Tailwind/MUI/Chakra.

**Rationale:**
- Requirements state "lightweight UI is perfectly fine"
- No external dependencies needed
- Faster development for prototype
- Demonstrates CSS knowledge without library dependency

### 7. API-Level Authorization Instead of Route Guards

**Decision:** Protected API endpoints with `.authorization((allow) => [allow.authenticated()])` instead of frontend route guards.

**Rationale:**
- Security should be enforced server-side
- Frontend guards can be bypassed
- AppSync handles auth before Lambda execution
- Simpler implementation with same security guarantees

## Assumptions

1. **Test Mode Only**: Application uses Stripe test mode with test customer IDs
2. **Single Customer**: All authenticated users map to the same test Stripe customer
3. **Email/Password Auth**: Used Cognito email/password instead of social providers
4. **No Sign-Up Flow**: Users created on first sign-in without email confirmation
5. **Single Subscription**: Assumes customer has at most one active subscription
6. **Local Return URL**: Billing portal redirects to `http://localhost:5173` after changes
7. **No Persistence**: No database for user-customer mapping (as per requirements)
8. **Minimal UI**: Focused on functionality over design polish

## What I Would Improve with More Time

### High Priority

1. **User-Customer Mapping Database**
   - Store `userId -> stripeCustomerId` in DynamoDB
   - Automatically create Stripe customers on signup
   - Support multiple customers instead of hardcoded ID

2. **Webhook Integration**
   - Add Stripe webhook endpoint to handle events
   - Update subscription status in real-time
   - Listen for `customer.subscription.updated`, `invoice.paid`, etc.
   - Cache subscription data to reduce Stripe API calls

3. **Better Error Handling**
   - User-friendly error messages
   - Retry logic for transient failures
   - Sentry or CloudWatch integration for monitoring
   - Graceful degradation when Stripe is down

4. **Environment Configuration**
   - Separate dev/staging/production environments
   - Dynamic return URLs based on environment
   - Environment-specific customer IDs

### Medium Priority

5. **UI Enhancements**
   - Billing history table with past invoices
   - Subscription timeline showing status changes
   - Payment method display
   - Upgrade/downgrade plan options
   - Mobile-responsive design improvements

6. **Testing**
   - Unit tests for Lambda functions
   - Integration tests for Stripe API calls
   - E2E tests with Cypress or Playwright
   - Mock Stripe API for test reliability

7. **Performance Optimizations**
   - Cache subscription data client-side (React Query)
   - Implement polling or WebSocket for real-time updates
   - Add CDN caching for static assets
   - Lazy loading for components

### Low Priority

8. **Analytics**
   - Add Amplitude event tracking
   - Track subscription page views
   - Track billing portal clicks
   - Monitor subscription status changes

9. **Security Hardening**
   - Rate limiting on Lambda functions
   - Request validation schemas
   - CORS configuration tightening
   - Security headers (CSP, etc.)

10. **Developer Experience**
    - Comprehensive README with troubleshooting
    - Seed script for test data
    - Docker setup for consistent environments
    - CI/CD pipeline with GitHub Actions

## API Documentation

### GraphQL Queries

#### `getSubscriptionStatus`

Fetches the current subscription status for the authenticated user.

**Returns:**
```typescript
{
  status: string           // "active" | "trialing" | "past_due" | "canceled" | "No subscription"
  planName: string         // Name of the subscription plan
  currentPeriodEnd: string | null  // ISO date string
  cancelAtPeriodEnd: boolean
  userId: string          // Cognito user ID
}
```

#### `createBillingPortalSession`

Creates a Stripe Billing Portal session and returns the redirect URL.

**Returns:**
```typescript
{
  url: string    // Stripe billing portal URL
  userId: string // Cognito user ID
}
```

## Environment Variables Reference

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `STRIPE_SECRET_KEY` | Stripe API secret key | `sk_test_...` | Yes |
| `RETURN_URL` | Billing portal return URL | `http://localhost:5173` | No (has default) |

## Troubleshooting

### "Not authenticated" error
- Ensure you're signed in
- Check that Cognito user pool is properly configured
- Verify AppSync authorization mode is set to `userPool`

### "Failed to fetch subscription status"
- Verify `STRIPE_SECRET_KEY` is set correctly
- Check that the customer ID exists in Stripe
- Ensure Lambda has internet access to call Stripe API

### Billing portal returns to wrong URL
- Update `RETURN_URL` in `amplify/functions/create-billing-portal-session/resource.ts`
- Redeploy with `npx ampx sandbox`

### Lambda timeout errors
- Increase timeout in `resource.ts` files
- Check Stripe API status
- Verify network connectivity from Lambda

## License

This project is licensed under the MIT-0 License.

## Acknowledgments

- Built with [AWS Amplify Gen 2](https://docs.amplify.aws/react/)
- Powered by [Stripe API](https://stripe.com/docs/api)
- Bootstrapped with [Vite](https://vitejs.dev/)