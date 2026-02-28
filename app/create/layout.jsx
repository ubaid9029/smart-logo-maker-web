import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SecondNavbar from "../components/SecondNavbar";
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

export default async function RootLayout({ children }) {

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SecondNavbar />
        {children}
      </body>
    </html>
  );
}
