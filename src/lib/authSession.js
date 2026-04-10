"use client";

const AUTH_SESSION_ENDPOINT = "/auth/session";

export async function readAuthSession() {
  const response = await fetch(AUTH_SESSION_ENDPOINT, {
    credentials: "include",
    cache: "no-store",
  });

  const contentType = response.headers.get("content-type") || "";
  const isJsonResponse = contentType.includes("application/json");
  const payload = isJsonResponse
    ? await response.json().catch(() => null)
    : null;

  if (!response.ok) {
    return {
      user: null,
      error: payload?.error || `Auth session request failed with status ${response.status}.`,
    };
  }

  return payload && typeof payload === "object"
    ? payload
    : { user: null };
}
