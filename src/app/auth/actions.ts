"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabaseServer";

function normalizeNextPath(value: FormDataEntryValue | string | null | undefined) {
    const nextValue = typeof value === "string" ? value.trim() : "";
    if (!nextValue.startsWith("/") || nextValue.startsWith("//")) {
        return "/";
    }
    return nextValue;
}

export async function signIn(formData: FormData) {
    const supabase = await createClient();

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const next = normalizeNextPath(formData.get("next"));

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        redirect(`/auth/signin?error=${encodeURIComponent(error.message)}&next=${encodeURIComponent(next)}`);
    }

    revalidatePath("/", "layout");
    redirect(next);
}

export async function signUp(formData: FormData) {
    const supabase = await createClient();
    const origin = (await headers()).get("origin");

    const fullName = formData.get("fullName") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { full_name: fullName },
            emailRedirectTo: origin ? `${origin}/auth/callback` : undefined,
        },
    });

    if (error) {
        redirect(`/auth/signup?error=${encodeURIComponent(error.message)}`);
    }

    revalidatePath("/", "layout");
    redirect("/auth/signup?message=Check+your+email+to+confirm+your+account.");
}

export async function signOut() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath("/", "layout");
    redirect("/auth/signin");
}

export async function signInWithGoogle(formData: FormData) {
    const supabase = await createClient();
    const origin = (await headers()).get("origin");
    const next = normalizeNextPath(formData.get("next"));

    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
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
    const email = formData.get("email") as string;
    const origin = (await headers()).get("origin");

    const redirectTo = origin ? `${origin}/auth/update-password` : undefined;

    const { error } = await supabase.auth.resetPasswordForEmail(
        email,
        redirectTo ? { redirectTo } : undefined
    );

    if (error) {
        redirect(`/auth/forgot-password?error=${encodeURIComponent(error.message)}`);
    }

    redirect("/auth/forgot-password?message=Check+your+email+for+the+password+reset+link.");
}
