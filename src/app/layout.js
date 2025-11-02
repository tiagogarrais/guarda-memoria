"use client";

import { SessionProvider } from "next-auth/react";
import Link from "next/link";
import { useSession, signOut, signIn } from "next-auth/react";
import { useEffect } from "react";
import "./globals.css";

function Header() {
  const { data: session } = useSession();

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: "#fff",
        borderBottom: "1px solid #e0e0e0",
        padding: "12px 24px",
        zIndex: 1000,
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Link
          href="/"
          style={{
            textDecoration: "none",
            color: "#333",
            fontSize: "24px",
            fontWeight: "bold",
          }}
        >
          Guarda Memória
        </Link>

        <nav>
          {session ? (
            <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
              <Link
                href="/profile"
                style={{
                  color: "#007bff",
                  textDecoration: "none",
                  padding: "8px 12px",
                  borderRadius: "4px",
                  transition: "background-color 0.2s",
                }}
              >
                Meu Perfil
              </Link>
              <button
                onClick={() => signOut()}
                style={{
                  backgroundColor: "#dc3545",
                  color: "white",
                  border: "none",
                  padding: "8px 12px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                Sair
              </button>
            </div>
          ) : (
            <button
              onClick={() => signIn()}
              style={{
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              Entrar
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#f8f9fa",
        borderTop: "1px solid #e0e0e0",
        padding: "12px 24px",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          textAlign: "center",
          color: "#6c757d",
          fontSize: "14px",
        }}
      >
        © 2025 Guarda Memória. Todos os direitos reservados.
      </div>
    </footer>
  );
}

export default function RootLayout({ children }) {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("SW registered: ", registration);
        })
        .catch((error) => {
          console.log("SW registration failed: ", error);
        });
    }
  }, []);

  return (
    <html lang="pt-BR">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#007bff" />
      </head>
      <body style={{ margin: 0, padding: 0 }}>
        <SessionProvider>
          <Header />
          <main
            style={{
              marginTop: "80px", // Altura do header
              marginBottom: "60px", // Altura do footer
              minHeight: "calc(100vh - 140px)", // Altura total menos header e footer
            }}
          >
            {children}
          </main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
