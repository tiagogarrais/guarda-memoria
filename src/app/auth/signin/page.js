"use client";

import { getProviders, signIn, getSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SignIn() {
  const [providers, setProviders] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession();
      if (session) {
        router.push("/");
        return;
      }
    };

    const getProvidersData = async () => {
      try {
        const providers = await getProviders();
        setProviders(providers);
      } catch (error) {
        console.error("Erro ao carregar providers:", error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
    getProvidersData();
  }, [router]);

  const handleSignIn = async (providerId) => {
    try {
      setLoading(true);
      await signIn(providerId, { callbackUrl: "/" });
    } catch (error) {
      console.error("Erro no sign in:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <div>Carregando...</div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "20px",
        backgroundColor: "#f5f5f5",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "40px",
          borderRadius: "8px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          textAlign: "center",
          maxWidth: "400px",
          width: "100%",
        }}
      >
        <h1 style={{ marginBottom: "30px", color: "#333" }}>
          Entrar no Guarda Memória
        </h1>

        {providers &&
          Object.values(providers).map((provider) => (
            <div key={provider.name} style={{ marginBottom: "15px" }}>
              <button
                onClick={() => handleSignIn(provider.id)}
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "12px 20px",
                  backgroundColor:
                    provider.id === "google" ? "#4285f4" : "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontSize: "16px",
                  fontWeight: "500",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {provider.id === "google" && (
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                )}
                Entrar com {provider.name}
              </button>
            </div>
          ))}

        <p style={{ marginTop: "20px", color: "#666", fontSize: "14px" }}>
          Ao entrar, você concorda com nossos termos de uso e política de
          privacidade.
        </p>
      </div>
    </div>
  );
}
