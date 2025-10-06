// Example Checkout Button Component
// Demonstrates how to use Stripe checkout in a React component

"use client";

import { useState } from "react";
import { redirectToCheckout } from "@/lib/stripe/client-helpers";

interface CheckoutButtonProps {
  plan: "MONTHLY" | "ANNUAL";
  userId: string;
  userEmail: string;
  userName: string;
  stripeCustomerId?: string;
  className?: string;
  children?: React.ReactNode;
}

export function CheckoutButton({
  plan,
  userId,
  userEmail,
  userName,
  stripeCustomerId,
  className = "",
  children,
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    try {
      setLoading(true);
      setError(null);

      await redirectToCheckout({
        plan,
        userId,
        userEmail,
        userName,
        stripeCustomerId,
      });
    } catch (err) {
      console.error("Checkout error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to start checkout"
      );
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleCheckout}
        disabled={loading}
        className={`${className} ${
          loading ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {loading ? "Loading..." : children || "Subscribe"}
      </button>
      {error && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
