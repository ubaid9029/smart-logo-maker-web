"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabaseServer";
import { headers } from "next/headers";

// ─── Sign In ────────────────────────────────────────────────────────────────
export async function signIn(formData: FormData) {
    const supabase = await createClient();

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        redirect(`/auth/signin?error=${encodeURIComponent(error.message)}`);
    }

    revalidatePath("/", "layout");
    redirect("/");
}

// ─── Sign Up ────────────────────────────────────────────────────────────────
export async function signUp(formData: FormData) {
    const supabase = await createClient();

    const fullName = formData.get("fullName") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { full_name: fullName },
        },
    });

    if (error) {
        redirect(`/auth/signup?error=${encodeURIComponent(error.message)}`);
    }

    revalidatePath("/", "layout");
    redirect("/auth/signup?message=Check+your+email+to+confirm+your+account.");
}

// ─── Sign Out ───────────────────────────────────────────────────────────────
export async function signOut() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath("/", "layout");
    redirect("/auth/signin");
}

// ─── Google OAuth ────────────────────────────────────────────────────────────
export async function signInWithGoogle() {
    const supabase = await createClient();
    const origin = (await headers()).get("origin");

    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${origin}/auth/callback`,
            },
        });

        if (error) {
            redirect(
                `/auth/signin?error=${encodeURIComponent(
                    error.message || "Google sign-in is not enabled. Please enable it in Supabase."
                )}`
            );
        }

        if (data?.url) {
            redirect(data.url);
        }
    } catch (err: unknown) {
        // If the error is a NEXT_REDIRECT (from redirect()), re-throw it
        if (
            err instanceof Error &&
            (err as Error & { digest?: string }).digest?.startsWith("NEXT_REDIRECT")
        ) {
            throw err;
        }
        redirect(
            `/auth/signin?error=${encodeURIComponent(
                "Google sign-in is not configured yet. Please use email and password."
            )}`
        );
    }
}
