import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabaseServer";

function normalizeNextPath(value: string | null | undefined) {
    const nextValue = typeof value === "string" ? value.trim() : "";
    if (!nextValue.startsWith("/") || nextValue.startsWith("//")) {
        return null;
    }
    return nextValue;
}

export async function GET(request: Request) {
    const cookieStore = await cookies();
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const providerError = searchParams.get("error");
    const providerErrorDescription = searchParams.get("error_description");
    const next = normalizeNextPath(searchParams.get("next"))
        || normalizeNextPath(cookieStore.get("auth-return-to")?.value)
        || "/";

    if (providerError || providerErrorDescription) {
        const nextErrorMessage = providerErrorDescription || providerError || "Could not authenticate user";
        return NextResponse.redirect(
            `${origin}/auth/signin?error=${encodeURIComponent(nextErrorMessage)}&next=${encodeURIComponent(next)}`
        );
    }

    if (code) {
        const supabase = await createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            const response = NextResponse.redirect(`${origin}${next}`);
            response.cookies.set("auth-return-to", "", { path: "/", maxAge: 0 });
            response.cookies.set("oauth-return-to", "", { path: "/", maxAge: 0 });
            return response;
        }

        return NextResponse.redirect(
            `${origin}/auth/signin?error=${encodeURIComponent(error.message || "Could not authenticate user")}&next=${encodeURIComponent(next)}`
        );
    }

    // If something went wrong, send them back to sign-in with an error
    return NextResponse.redirect(
        `${origin}/auth/signin?error=${encodeURIComponent("Could not authenticate user")}&next=${encodeURIComponent(next)}`
    );
}
