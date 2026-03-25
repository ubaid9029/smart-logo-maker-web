import './globals.css';
import ConditionalLayout from "../components/MainComponents/ConditionalLayout";
import { Providers } from "./providers";
import ClientPersistGate from "../components/ClientPersistGate"; // Nayi file

export const metadata = {
  title: "Smart Logo Maker"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
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
