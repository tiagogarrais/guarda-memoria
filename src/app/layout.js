"use client";

import { SessionProvider } from "next-auth/react";
import { CityProvider } from "@/contexts/CityContext";
import PWA from "@/components/PWA";
import LocalStorageCleanup from "@/components/LocalStorageCleanup";

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#007bff" />
        <meta
          name="description"
          content="Preserve memórias de pessoas em cidades brasileiras"
        />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        <title>Guarda Memória</title>
      </head>
      <body>
        <LocalStorageCleanup />
        <SessionProvider>
          <CityProvider>{children}</CityProvider>
        </SessionProvider>
        <PWA />
      </body>
    </html>
  );
}
