import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
    // Forward the pathname so Server Components can read it via headers()
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-pathname", request.nextUrl.pathname);

    let supabaseResponse = NextResponse.next({
        request: { headers: requestHeaders },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
    const isCallback = pathname.startsWith("/auth/callback");

    // --- CHANGE IS HERE ---
    // Humne protectedPrefixes se "/editor" ko hata diya hai
    if (!user && !isAuthRoute) {
        const protectedPrefixes = ["/dashboard", "/account"]; 
        const isProtected = protectedPrefixes.some((p) => pathname.startsWith(p));

        if (isProtected) {
            const url = request.nextUrl.clone();
            url.pathname = "/auth/signin";
            return NextResponse.redirect(url);
        }
    }

    // If the user IS logged in, redirect away from auth pages
    if (user && isAuthRoute && !isCallback) {
        const url = request.nextUrl.clone();
        url.pathname = "/";
        return NextResponse.redirect(url);
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};