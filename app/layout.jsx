import { Geist, Geist_Mono } from "next/font/google";
import './globals.css';
import ConditionalLayout from "../components/MainComponents/ConditionalLayout";
import { Providers } from "./providers"; // Custom provider import karein

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"]
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"]
});

export const metadata = {
  title: "Smart Logo Maker"
};

export default function Layout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* Providers ke andar store already configured hai */}
        <Providers>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </Providers>
      </body>
    </html>
  );
}