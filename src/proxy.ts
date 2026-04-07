import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv } from "./lib/supabaseConfig";

const normalizeNextPath = (value: string | null | undefined) => {
    const nextValue = typeof value === "string" ? value.trim() : "";
    if (!nextValue.startsWith("/") || nextValue.startsWith("//")) {
        return null;
    }
    return nextValue;
};

export async function proxy(request: NextRequest) {
    // Forward the pathname so Server Components can read it via headers()
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-pathname", request.nextUrl.pathname);

    const { url: supabaseUrl, anonKey: supabaseAnonKey } = getSupabaseEnv();

    // Frontend-only local mode: allow the app to run when Supabase env vars
    // are not available yet. Auth/session behavior stays disabled until env is added.
    if (!supabaseUrl || !supabaseAnonKey) {
        return NextResponse.next({
            request: { headers: requestHeaders },
        });
    }

    let supabaseResponse = NextResponse.next({
        request: { headers: requestHeaders },
    });

    const supabase = createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({ request: { headers: requestHeaders } });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // Refresh the session so it doesn't expire
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { pathname } = request.nextUrl;

    const isAuthRoute = pathname.startsWith("/auth");
    const authReturnTo = normalizeNextPath(request.nextUrl.searchParams.get("next"));
    const pendingReturnTo = normalizeNextPath(request.cookies.get("auth-return-to")?.value);

    if (isAuthRoute && authReturnTo && authReturnTo !== "/") {
        supabaseResponse.cookies.set("auth-return-to", authReturnTo, {
            path: "/",
            sameSite: "lax",
        });
    }

    const hasOAuthParams = (
        request.nextUrl.searchParams.has("code") ||
        request.nextUrl.searchParams.has("error") ||
        request.nextUrl.searchParams.has("error_description")
    );

    if (
        pathname === "/" &&
        hasOAuthParams &&
        pendingReturnTo &&
        pendingReturnTo !== "/" &&
        !pendingReturnTo.startsWith("/auth")
    ) {
        const callbackUrl = request.nextUrl.clone();
        callbackUrl.pathname = "/auth/callback";
        callbackUrl.searchParams.set("next", pendingReturnTo);
        return NextResponse.redirect(callbackUrl);
    }

    // --- CHANGE IS HERE ---
    // Humne protectedPrefixes se "/editor" ko hata diya hai
    if (!user && !isAuthRoute) {
        const protectedPrefixes = ["/dashboard", "/account"]; 
        const isProtected = protectedPrefixes.some((p) => pathname.startsWith(p));

        if (isProtected) {
            const url = request.nextUrl.clone();
            url.pathname = "/auth/signin";
            const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
            url.searchParams.set("next", nextPath || "/");
            return NextResponse.redirect(url);
        }
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};

