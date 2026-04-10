"use client";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function ConditionalLayout({ children }) {
  const pathname = usePathname();
  
  const isAuthRoute = pathname.startsWith("/auth");
  const isCreateRoute = pathname.startsWith("/create");
  const isGeneratingRoute = pathname.startsWith("/generating");
  const isResultRoute = pathname.startsWith("/result");
  const isEditorRoute = pathname.startsWith("/editor");

  // Navbar stays hidden for auth routes only. We keep it visible elsewhere (including editor)
  // so users have consistent navigation.
  // Footer remains hidden inside the editor for a focused workspace.
  const hideFooterOnly = isEditorRoute;

  return (
    <>
      <a
        href="#main-content"
        className="skip-link sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-slate-950 focus:px-5 focus:py-3 focus:text-sm focus:font-bold focus:text-white focus:shadow-xl"
      >
        Skip to main content
      </a>

      {/* Navbar: hidden only on auth routes */}
      {!isAuthRoute && (
        <div className="app-navbar-shell">
          <Navbar minimal={isCreateRoute || isGeneratingRoute || isResultRoute || isEditorRoute} />
        </div>
      )}

      <main id="main-content" tabIndex={-1}>{children}</main>

      {/* Footer: Auth, Create, aur Editor par hide hoga */}
      {!isAuthRoute && !isCreateRoute && !hideFooterOnly && !isGeneratingRoute && !isResultRoute && <Footer />}

      <style jsx global>{`
        body.editor-preview-open .app-navbar-shell {
          display: none;
        }
      `}</style>
    </>
  );
}
