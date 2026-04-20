"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabaseClient";

interface GoogleAuthButtonProps {
  fallbackNext?: string;
  returnToAuthPath: string;
}

function normalizeNextPath(value?: string | null) {
  const nextValue = typeof value === "string" ? value.trim() : "";
  if (!nextValue.startsWith("/") || nextValue.startsWith("//")) {
    return null;
  }
  return nextValue;
}

export default function GoogleAuthButton({
  fallbackNext = "/",
  returnToAuthPath,
}: GoogleAuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const resolvedFallbackNext = useMemo(
    () => normalizeNextPath(fallbackNext) || "/",
    [fallbackNext]
  );

  const handleGoogleAuth = async () => {
    if (isLoading || typeof window === "undefined") {
      return;
    }

    setIsLoading(true);

    const queryNext = normalizeNextPath(
      new URLSearchParams(window.location.search).get("next")
    );
    const next = queryNext || resolvedFallbackNext;

    if (next === "/") {
      document.cookie = "auth-return-to=; path=/; max-age=0; samesite=lax";
      document.cookie = "oauth-return-to=; path=/; max-age=0; samesite=lax";
    } else {
      document.cookie = `auth-return-to=${encodeURIComponent(next)}; path=/; samesite=lax`;
      document.cookie = `oauth-return-to=${encodeURIComponent(next)}; path=/; max-age=600; samesite=lax`;
    }

    try {
      const supabase = createClient();
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(next)}`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error || !data?.url) {
        throw error || new Error("Google sign-in could not be started.");
      }

      window.location.assign(data.url);
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : "Google sign-in is not configured yet. Please use email and password.";

      window.location.assign(
        `${returnToAuthPath}?error=${encodeURIComponent(message)}&next=${encodeURIComponent(next)}`
      );
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleAuth}
      disabled={isLoading}
      className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-gray-300 text-sm font-medium text-gray-900 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70"
    >
      <Image src="/assets/icons/google.png" width={16} height={16} className="h-4 w-4" alt="Google" />
      {isLoading ? "Redirecting..." : "Continue with Google"}
    </button>
  );
}
