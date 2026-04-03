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

  // Navbar ab generating, result, aur editor par hide nahi hoga
  // Footer abhi bhi sirf editor par hide rahega
  const hideFooterOnly = isEditorRoute;

  return (
    <>
      <a
        href="#main-content"
        className="skip-link sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-slate-950 focus:px-5 focus:py-3 focus:text-sm focus:font-bold focus:text-white focus:shadow-xl"
      >
        Skip to main content
      </a>

      {/* Navbar: Auth aur Editor par hide hoga, baki sab par show hoga */}
      {!isAuthRoute && !isEditorRoute && (
        <Navbar minimal={isCreateRoute || isGeneratingRoute || isResultRoute} />
      )}

      <main id="main-content" tabIndex={-1}>{children}</main>

      {/* Footer: Auth, Create, aur Editor par hide hoga */}
      {!isAuthRoute && !isCreateRoute && !hideFooterOnly && !isGeneratingRoute && !isResultRoute && <Footer />}
    </>
  );
}
