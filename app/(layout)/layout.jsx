import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import Navbar from "../../components/Navbar.jsx";
import Footer from "../../components/Footer.jsx";
import { headers } from "next/headers";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata = {
    title: "Smart Logo Maker",
};

export default async function LandingLayout({ children }) {
    const headersList = await headers();
    const pathname = headersList.get("x-pathname") || "";
    const isAuthRoute = pathname.startsWith("/auth");

    return (
        <>
            {!isAuthRoute && <Navbar />}
            {children}
            {!isAuthRoute && <Footer />}
        </>
    );
}
