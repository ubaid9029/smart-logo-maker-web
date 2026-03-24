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
  const hideAll = isEditorRoute; // Navbar sirf editor par hide hoga

  return (
    <>
      {/* Navbar: Auth aur Editor par hide hoga, baki sab par show hoga */}
      {!isAuthRoute && !isEditorRoute && (
        <Navbar minimal={isCreateRoute || isGeneratingRoute || isResultRoute} />
      )}

      <main>{children}</main>

      {/* Footer: Auth, Create, aur Editor par hide hoga */}
      {!isAuthRoute && !isCreateRoute && !hideFooterOnly && !isGeneratingRoute && !isResultRoute && <Footer />}
    </>
  );
}