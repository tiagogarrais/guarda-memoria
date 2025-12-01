"use client";

import { signIn, useSession } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";

export default function HomeHeader() {
  const { data: session } = useSession();
  const [email, setEmail] = useState("");
  const [isLoginExpanded, setIsLoginExpanded] = useState(false);

  return (
    <header
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        padding: "2rem 0",
        marginBottom: "3rem",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 2rem",
        }}
      >
        {/* Parte superior - Logo e Login */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "2rem",
            flexWrap: "wrap",
            gap: "1.5rem",
          }}
        >
          {/* Logo */}
          <div style={{ flex: "1", minWidth: "280px" }}>
            <h1
              style={{
                fontSize: "clamp(2rem, 5vw, 3rem)",
                margin: "0",
                fontWeight: "bold",
                textShadow: "0 2px 4px rgba(0,0,0,0.3)",
              }}
            >
              Guarda Memória
            </h1>
          </div>

          {/* Área de Login */}
          {!session && (
            <div
              style={{
                background: "rgba(255,255,255,0.1)",
                padding: "1.5rem",
                borderRadius: "12px",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.2)",
                minWidth: "280px",
                maxWidth: "350px",
                width: "100%",
                flexShrink: 0,
              }}
            >
              <h3
                style={{
                  margin: "0 0 1rem 0",
                  fontSize: "1.2rem",
                  fontWeight: "600",
                }}
              >
                Entre e Comece a Contribuir
              </h3>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                <input
                  type="email"
                  placeholder="Digite seu email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    padding: "0.75rem",
                    border: "1px solid rgba(255,255,255,0.3)",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    background: "rgba(255,255,255,0.9)",
                    color: "#333",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                />

                <button
                  onClick={() => signIn("email", { email })}
                  disabled={!email.includes("@")}
                  style={{
                    padding: "0.75rem",
                    background: email.includes("@")
                      ? "linear-gradient(135deg, #28a745 0%, #20c997 100%)"
                      : "rgba(255,255,255,0.3)",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: email.includes("@") ? "pointer" : "not-allowed",
                    fontSize: "1rem",
                    fontWeight: "600",
                    transition: "all 0.3s",
                    opacity: email.includes("@") ? 1 : 0.7,
                  }}
                >
                  📧 Receber Link Mágico
                </button>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    margin: "0.5rem 0",
                  }}
                >
                  <div
                    style={{
                      height: "1px",
                      background: "rgba(255,255,255,0.3)",
                      flex: 1,
                    }}
                  />
                  <span
                    style={{
                      padding: "0 1rem",
                      fontSize: "0.9rem",
                      opacity: 0.8,
                    }}
                  >
                    ou
                  </span>
                  <div
                    style={{
                      height: "1px",
                      background: "rgba(255,255,255,0.3)",
                      flex: 1,
                    }}
                  />
                </div>

                <button
                  onClick={() => signIn("google")}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    background: "white",
                    color: "#333",
                    border: "1px solid #dadce0",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "1rem",
                    fontWeight: "500",
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.75rem",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = "translateY(-1px)";
                    e.target.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Entrar com Google
                </button>
              </div>
            </div>
          )}

          {/* Se estiver logado, mostrar informação do usuário */}
          {session && (
            <div
              style={{
                background: "rgba(255,255,255,0.1)",
                padding: "1.5rem",
                borderRadius: "12px",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                minWidth: "280px",
                maxWidth: "400px",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: session.user?.image
                    ? `url(${session.user.image})`
                    : "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: "bold",
                }}
              >
                {!session.user?.image && (session.user?.name?.charAt(0) || "U")}
              </div>
              <div>
                <div style={{ fontWeight: "600", fontSize: "1rem" }}>
                  Bem-vindo, {session.user?.name || "Usuário"}!
                </div>
                <div style={{ fontSize: "0.9rem", opacity: 0.8 }}>
                  Escolha sua cidade para começar
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Parte inferior - Descrição */}
        <div
          style={{
            textAlign: "center",
            borderTop: "1px solid rgba(255,255,255,0.2)",
            paddingTop: "2rem",
          }}
        >
          <p
            style={{
              fontSize: "1.2rem",
              margin: "0",
              opacity: 0.95,
              fontWeight: "300",
              lineHeight: 1.6,
              maxWidth: "800px",
              margin: "0 auto",
            }}
          >
            Preservando histórias de pessoas, lugares, datas, eventos e obras de
            arte que marcaram nossas cidades
          </p>

          {!session && (
            <div
              style={{
                marginTop: "1.5rem",
                display: "flex",
                justifyContent: "center",
                gap: "1.5rem",
                flexWrap: "wrap",
                fontSize: "clamp(0.85rem, 2vw, 0.95rem)",
                opacity: 0.9,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  minWidth: "180px",
                  justifyContent: "center",
                }}
              >
                <span>✨</span>
                <span>Preserve memórias locais</span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  minWidth: "180px",
                  justifyContent: "center",
                }}
              >
                <span>🏛️</span>
                <span>Conecte gerações</span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  minWidth: "180px",
                  justifyContent: "center",
                }}
              >
                <span>🌟</span>
                <span>Valorize sua cultura</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
