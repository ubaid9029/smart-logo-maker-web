"use client";

import { useEffect, useMemo } from "react";

interface AuthNextFieldProps {
  fallbackNext?: string;
}

function normalizeNextPath(value?: string | null) {
  const nextValue = typeof value === "string" ? value.trim() : "";
  if (!nextValue.startsWith("/") || nextValue.startsWith("//")) {
    return null;
  }
  return nextValue;
}

function readCookieValue(name: string) {
  if (typeof document === "undefined") {
    return null;
  }

  const cookiePrefix = `${name}=`;
  const cookieEntry = document.cookie
    .split(";")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(cookiePrefix));

  if (!cookieEntry) {
    return null;
  }

  return decodeURIComponent(cookieEntry.slice(cookiePrefix.length));
}

function resolveSameOriginReferrerPath() {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return null;
  }

  const referrer = document.referrer?.trim();
  if (!referrer) {
    return null;
  }

  try {
    const referrerUrl = new URL(referrer);
    if (referrerUrl.origin !== window.location.origin) {
      return null;
    }

    const nextPath = `${referrerUrl.pathname}${referrerUrl.search}`;
    if (nextPath.startsWith("/auth")) {
      return null;
    }

    return normalizeNextPath(nextPath);
  } catch {
    return null;
  }
}

function resolvePreferredNext(initialNext: string) {
  if (typeof window === "undefined") {
    return initialNext;
  }

  const queryNext = normalizeNextPath(new URLSearchParams(window.location.search).get("next"));
  const cookieNext = normalizeNextPath(readCookieValue("auth-return-to"));
  const referrerNext = resolveSameOriginReferrerPath();
  return queryNext || cookieNext || referrerNext || initialNext || "/";
}

export default function AuthNextField({ fallbackNext = "/" }: AuthNextFieldProps) {
  const initialNext = useMemo(() => normalizeNextPath(fallbackNext) || "/", [fallbackNext]);
  const nextValue = useMemo(() => resolvePreferredNext(initialNext), [initialNext]);

  useEffect(() => {
    if (nextValue === "/") {
      document.cookie = "auth-return-to=; path=/; max-age=0; samesite=lax";
      return;
    }

    document.cookie = `auth-return-to=${encodeURIComponent(nextValue)}; path=/; samesite=lax`;
  }, [nextValue]);

  return <input suppressHydrationWarning type="hidden" name="next" value={nextValue} />;
}
