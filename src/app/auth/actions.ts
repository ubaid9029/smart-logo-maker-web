"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabaseServer";

function normalizeNextPath(value: FormDataEntryValue | string | null | undefined) {
    const nextValue = typeof value === "string" ? value.trim() : "";
    if (!nextValue.startsWith("/") || nextValue.startsWith("//")) {
        return null;
    }
    return nextValue;
}

function extractNextFromUrl(urlValue: string | null | undefined) {
    if (typeof urlValue !== "string" || !urlValue.trim()) {
        return null;
    }

    try {
        const nextUrl = new URL(urlValue);
        return normalizeNextPath(nextUrl.searchParams.get("next"));
    } catch {
        return null;
    }
}

async function resolveNextPath(value: FormDataEntryValue | string | null | undefined) {
    const directNext = normalizeNextPath(value);
    if (directNext) {
        return directNext;
    }

    const headerStore = await headers();
    const refererNext = extractNextFromUrl(headerStore.get("referer"));
    if (refererNext) {
        return refererNext;
    }

    const cookieStore = await cookies();
    const cookieNext = normalizeNextPath(cookieStore.get("auth-return-to")?.value);
    return cookieNext || "/";
}

function normalizeAuthField(value: FormDataEntryValue | null, mode: "email" | "text" | "password" = "text") {
    const rawValue = typeof value === "string" ? value : "";
    if (mode === "password") {
        return rawValue;
    }

    const trimmedValue = rawValue.trim();
    return mode === "email" ? trimmedValue.toLowerCase() : trimmedValue;
}

async function resolveRequestOrigin() {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
    if (siteUrl) {
        return siteUrl.endsWith("/") ? siteUrl.slice(0, -1) : siteUrl;
    }

    const headerStore = await headers();
    const directOrigin = headerStore.get("origin")?.trim();

    if (directOrigin) {
        return directOrigin;
    }

    const forwardedProto = headerStore.get("x-forwarded-proto")?.trim() || "https";
    const forwardedHost = headerStore.get("x-forwarded-host")?.trim();
    const host = forwardedHost || headerStore.get("host")?.trim();

    if (!host) {
        return "https://www.smart-logomaker.com"; // Final Fallback
    }

    return `${forwardedProto}://${host}`;
}

export async function signIn(formData: FormData) {
    const supabase = await createClient();
    const cookieStore = await cookies();

    const email = normalizeAuthField(formData.get("email"), "email");
    const password = normalizeAuthField(formData.get("password"), "password");
    const next = await resolveNextPath(formData.get("next"));

    if (!email || !password) {
        redirect(`/auth/signin?error=${encodeURIComponent("Please enter both email and password.")}&next=${encodeURIComponent(next)}`);
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        redirect(`/auth/signin?error=${encodeURIComponent(error.message)}&next=${encodeURIComponent(next)}`);
    }

    revalidatePath("/", "layout");
    cookieStore.set("auth-return-to", "", { path: "/", maxAge: 0 });
    cookieStore.set("oauth-return-to", "", { path: "/", maxAge: 0 });
    redirect(next);
}

export async function signUp(formData: FormData) {
    const supabase = await createClient();
    const origin = await resolveRequestOrigin();
    const next = await resolveNextPath(formData.get("next"));

    const fullName = normalizeAuthField(formData.get("fullName"), "text");
    const email = normalizeAuthField(formData.get("email"), "email");
    const password = normalizeAuthField(formData.get("password"), "password");

    if (!fullName || !email || !password) {
        redirect(`/auth/signup?error=${encodeURIComponent("Please fill in all required fields.")}&next=${encodeURIComponent(next)}`);
    }

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { full_name: fullName },
            emailRedirectTo: origin ? `${origin}/auth/callback?next=${encodeURIComponent(next)}` : undefined,
        },
    });

    if (error) {
        redirect(`/auth/signup?error=${encodeURIComponent(error.message)}&next=${encodeURIComponent(next)}`);
    }

    revalidatePath("/", "layout");
    redirect(`/auth/signup?message=${encodeURIComponent("Check your email to confirm your account before signing in.")}&next=${encodeURIComponent(next)}`);
}

export async function signOut() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath("/", "layout");
    redirect("/auth/signin");
}

export async function signInWithGoogle(formData: FormData) {
    const supabase = await createClient();
    const origin = await resolveRequestOrigin();
    const next = await resolveNextPath(formData.get("next"));
    const cookieStore = await cookies();

    if (next === "/") {
        cookieStore.set("auth-return-to", "", { path: "/", maxAge: 0 });
        cookieStore.set("oauth-return-to", "", { path: "/", maxAge: 0 });
    } else {
        cookieStore.set("auth-return-to", next, { path: "/", sameSite: "lax" });
        cookieStore.set("oauth-return-to", next, { path: "/", sameSite: "lax", maxAge: 600 });
    }

    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: origin ? `${origin}/auth/callback?next=${encodeURIComponent(next)}` : undefined,
            },
        });

        if (error) {
            redirect(
                `/auth/signin?error=${encodeURIComponent(
                    error.message || "Google sign-in is not enabled. Please enable it in Supabase."
                )}&next=${encodeURIComponent(next)}`
            );
        }

        if (data?.url) {
            redirect(data.url);
        }
    } catch (err: unknown) {
        if (
            err instanceof Error &&
            (err as Error & { digest?: string }).digest?.startsWith("NEXT_REDIRECT")
        ) {
            throw err;
        }

        redirect(
            `/auth/signin?error=${encodeURIComponent(
                "Google sign-in is not configured yet. Please use email and password."
            )}&next=${encodeURIComponent(next)}`
        );
    }
}

export async function requestPasswordReset(formData: FormData) {
    const supabase = await createClient();
    const email = normalizeAuthField(formData.get("email"), "email");
    const origin = await resolveRequestOrigin();
    const next = await resolveNextPath(formData.get("next"));

    if (!email) {
        redirect(`/auth/forgot-password?error=${encodeURIComponent("Please enter your email address.")}&next=${encodeURIComponent(next)}`);
    }

    const redirectTo = origin ? `${origin}/auth/update-password` : undefined;

    const { error } = await supabase.auth.resetPasswordForEmail(
        email,
        redirectTo ? { redirectTo } : undefined
    );

    if (error) {
        redirect(`/auth/forgot-password?error=${encodeURIComponent(error.message)}&next=${encodeURIComponent(next)}`);
    }

    redirect(`/auth/forgot-password?message=${encodeURIComponent("Check your email for the password reset link.")}&next=${encodeURIComponent(next)}`);
}
