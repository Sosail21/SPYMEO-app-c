// Example Customer Portal Button Component
// Demonstrates how to redirect to Stripe Customer Portal

"use client";

import { useState } from "react";
import { redirectToPortal } from "@/lib/stripe/client-helpers";

interface PortalButtonProps {
  stripeCustomerId: string;
  returnUrl?: string;
  className?: string;
  children?: React.ReactNode;
}

export function PortalButton({
  stripeCustomerId,
  returnUrl,
  className = "",
  children,
}: PortalButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePortal = async () => {
    try {
      setLoading(true);
      setError(null);

      await redirectToPortal({
        stripeCustomerId,
        returnUrl,
      });
    } catch (err) {
      console.error("Portal error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to open portal"
      );
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handlePortal}
        disabled={loading}
        className={`${className} ${
          loading ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {loading ? "Loading..." : children || "Manage Subscription"}
      </button>
      {error && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
