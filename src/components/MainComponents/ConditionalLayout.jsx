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
    <div className="flex min-h-screen flex-col">
      <a
        href="#main-content"
        className="skip-link sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-slate-950 focus:px-5 focus:py-3 focus:text-sm focus:font-bold focus:text-white focus:shadow-xl"
      >
        Skip to main content
      </a>

      {/* Navbar: hidden only on auth routes */}
      {!isAuthRoute && (
        <div className="app-navbar-shell flex-none">
          <Navbar minimal={isCreateRoute || isGeneratingRoute || isResultRoute || isEditorRoute} />
        </div>
      )}

      {/* Main content expands to push footer to the bottom */}
        <main id="main-content" tabIndex={-1} className="flex-1 w-full flex flex-col bg-[#fffaf7]">
          {children}
      </main>

      {/* Footer stays at the bottom */}
      {!isAuthRoute && !isCreateRoute && !hideFooterOnly && !isGeneratingRoute && !isResultRoute && (
        <div className="flex-none">
          <Footer />
        </div>
      )}

      <style jsx global>{`
        body.editor-preview-open .app-navbar-shell {
          display: none;
        }
      `}</style>
    </div>
  );
}
