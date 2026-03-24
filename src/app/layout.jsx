import { Geist, Geist_Mono } from "next/font/google";
import './globals.css';
import ConditionalLayout from "../components/MainComponents/ConditionalLayout";
import { Providers } from "./providers";
import ClientPersistGate from "../components/ClientPersistGate"; // Nayi file

export const metadata = {
  title: "Smart Logo Maker"
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"]
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"]
});


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Providers>
          <ClientPersistGate>
            <ConditionalLayout>
              {children}
            </ConditionalLayout>
          </ClientPersistGate>
        </Providers>
      </body>
    </html>
  );
}
