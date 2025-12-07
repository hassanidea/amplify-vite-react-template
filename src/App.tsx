import { useState, useEffect } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { signIn, signOut, getCurrentUser } from "aws-amplify/auth";

const client = generateClient<Schema>();

// Type for subscription data from Lambda
type SubscriptionData = {
  status: string;
  planName: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  userId: string;
};

function App() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignedIn, setIsSignedIn] = useState(false);

  // Check if user is signed in on mount
  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (isSignedIn) {
      fetchSubscription();
    }
  }, [isSignedIn]);

  async function checkUser() {
    try {
      await getCurrentUser();
      setIsSignedIn(true);
    } catch {
      setIsSignedIn(false);
    }
  }

  async function handleSignIn() {
    const email = prompt("Enter email:");
    const password = prompt("Enter password:");

    if (!email || !password) return;

    try {
      await signIn({ username: email, password });
      setIsSignedIn(true);
      alert("Signed in successfully!");
    } catch (err) {
      alert("Sign in failed: " + (err as Error).message);
    }
  }

  async function handleSignOut() {
    await signOut();
    setIsSignedIn(false);
    setSubscription(null);
    setError(null);
  }

  async function fetchSubscription() {
    setLoading(true);
    setError(null);

    try {
      console.log("Fetching subscription...");
      const { data, errors } = await client.queries.getSubscriptionStatus();
      console.log("Response:", { data, errors });

      if (errors) {
        setError(errors.map((e) => e.message).join(", "));
      } else if (data) {
        // Parse the JSON string into an object
        setSubscription(data as SubscriptionData);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleManageBilling() {
    setLoading(true);
    setError(null);

    try {
      const { data, errors } =
        await client.queries.createBillingPortalSession();

      if (errors) {
        setError(errors.map((e) => e.message).join(", "));
      } else if (data) {
        // Redirect to Stripe billing portal
        if (data.url) {
          window.location.href = data.url;
        }
      }
    } catch (err) {
      console.error("Billing portal error:", err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case "active":
        return "#10b981";
      case "trialing":
        return "#3b82f6";
      case "past_due":
        return "#f59e0b";
      case "canceled":
      case "unpaid":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  }

  function formatDate(dateString: string | null): string {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  return (
    <main
      style={{
        padding: "2rem",
        fontFamily: "sans-serif",
        maxWidth: "800px",
        margin: "0 auto",
      }}
    >
      <h1 style={{ marginBottom: "2rem" }}>Subscription Status Viewer</h1>

      {!isSignedIn ? (
        <div
          style={{
            padding: "2rem",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          <p style={{ marginBottom: "1rem" }}>
            Please sign in to view your subscription status.
          </p>
          <button
            onClick={handleSignIn}
            style={{
              padding: "0.75rem 1.5rem",
              background: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            Sign In
          </button>
        </div>
      ) : (
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1.5rem",
            }}
          >
            <p style={{ margin: 0 }}>✅ Signed in</p>
            <div>
              <button
                onClick={fetchSubscription}
                disabled={loading}
                style={{
                  padding: "0.5rem 1rem",
                  background: "#10b981",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: loading ? "not-allowed" : "pointer",
                  marginRight: "0.5rem",
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {loading ? "Refreshing..." : "Refresh"}
              </button>
              <button
                onClick={handleSignOut}
                style={{
                  padding: "0.5rem 1rem",
                  background: "#6b7280",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Sign Out
              </button>
            </div>
          </div>

          {error && (
            <div
              style={{
                padding: "1rem",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "8px",
                color: "#991b1b",
                marginBottom: "1.5rem",
              }}
            >
              <strong>Error:</strong> {error}
            </div>
          )}

          {loading && !subscription && (
            <div style={{ textAlign: "center", padding: "3rem" }}>
              <p>Loading subscription data...</p>
            </div>
          )}

          {subscription && (
            <div
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "2rem",
                background: "white",
              }}
            >
              <div style={{ marginBottom: "1.5rem" }}>
                <h2 style={{ margin: "0 0 0.5rem 0" }}>Subscription Details</h2>
                <div
                  style={{
                    display: "inline-block",
                    padding: "0.5rem 1rem",
                    borderRadius: "6px",
                    background: getStatusColor(subscription.status),
                    color: "white",
                    fontWeight: "bold",
                    textTransform: "capitalize",
                  }}
                >
                  {subscription.status}
                </div>
              </div>

              <div
                style={{ display: "grid", gap: "1.5rem", marginTop: "1.5rem" }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontWeight: "600",
                      marginBottom: "0.5rem",
                      color: "#374151",
                    }}
                  >
                    Plan Name
                  </label>
                  <p style={{ margin: 0, fontSize: "1.125rem" }}>
                    {subscription.planName}
                  </p>
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontWeight: "600",
                      marginBottom: "0.5rem",
                      color: "#374151",
                    }}
                  >
                    Current Period Ends
                  </label>
                  <p style={{ margin: 0, fontSize: "1.125rem" }}>
                    {formatDate(subscription.currentPeriodEnd)}
                  </p>
                </div>

                {subscription.cancelAtPeriodEnd && (
                  <div
                    style={{
                      padding: "1rem",
                      background: "#fef3c7",
                      border: "1px solid #fde68a",
                      borderRadius: "6px",
                      color: "#92400e",
                    }}
                  >
                    ⚠️ <strong>Subscription will cancel</strong> at the end of
                    the current period.
                  </div>
                )}
              </div>

              <div
                style={{
                  marginTop: "2rem",
                  paddingTop: "1.5rem",
                  borderTop: "1px solid #e5e7eb",
                }}
              >
                <button
                  onClick={handleManageBilling}
                  disabled={loading}
                  style={{
                    padding: "0.75rem 1.5rem",
                    background: "#6366f1",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: loading ? "not-allowed" : "pointer",
                    fontSize: "1rem",
                    fontWeight: "600",
                    opacity: loading ? 0.6 : 1,
                    width: "100%",
                  }}
                >
                  {loading ? "Opening Billing Portal..." : "Manage Billing"}
                </button>
                <p
                  style={{
                    marginTop: "0.75rem",
                    fontSize: "0.875rem",
                    color: "#6b7280",
                    textAlign: "center",
                  }}
                >
                  Update payment method, view invoices, or cancel subscription
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}

export default App;
