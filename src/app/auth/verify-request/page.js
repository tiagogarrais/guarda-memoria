"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function VerifyRequestContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          padding: "3rem",
          maxWidth: "500px",
          width: "100%",
          textAlign: "center",
          boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{
            fontSize: "4rem",
            marginBottom: "1.5rem",
          }}
        >
          📧
        </div>

        <h1
          style={{
            color: "#333",
            fontSize: "1.8rem",
            marginBottom: "1rem",
            fontWeight: "600",
          }}
        >
          Verifique seu email
        </h1>

        <p
          style={{
            color: "#666",
            fontSize: "1.1rem",
            lineHeight: 1.6,
            marginBottom: "1.5rem",
          }}
        >
          Um link de acesso foi enviado para{" "}
          {email && <strong style={{ color: "#667eea" }}>{email}</strong>}
          {!email && "seu email"}.
        </p>

        <div
          style={{
            background: "#f8f9fa",
            border: "1px solid #e9ecef",
            borderRadius: "8px",
            padding: "1.5rem",
            marginBottom: "2rem",
          }}
        >
          <h3
            style={{
              color: "#495057",
              fontSize: "1rem",
              margin: "0 0 1rem 0",
              fontWeight: "600",
            }}
          >
            📋 O que fazer agora:
          </h3>
          <ul
            style={{
              color: "#6c757d",
              fontSize: "0.95rem",
              textAlign: "left",
              margin: 0,
              paddingLeft: "1.5rem",
            }}
          >
            <li style={{ marginBottom: "0.5rem" }}>
              Abra sua caixa de entrada
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
              Procure por um email do <strong>Guarda Memória</strong>
            </li>
            <li style={{ marginBottom: "0.5rem" }}>Clique no link de acesso</li>
            <li>Você será conectado automaticamente</li>
          </ul>
        </div>

        <div
          style={{
            background: "#fff3cd",
            border: "1px solid #ffeaa7",
            borderRadius: "8px",
            padding: "1rem",
            marginBottom: "2rem",
          }}
        >
          <p
            style={{
              color: "#856404",
              fontSize: "0.9rem",
              margin: 0,
            }}
          >
            <strong>💡 Dica:</strong> Verifique também a pasta de spam ou
            promoções do seu email.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "1rem",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <a
            href="/"
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              padding: "0.75rem 1.5rem",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: "500",
              transition: "all 0.3s",
              display: "inline-block",
            }}
            onMouseOver={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 8px 16px rgba(0,0,0,0.2)";
            }}
            onMouseOut={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "none";
            }}
          >
            🏠 Voltar ao início
          </a>

          <button
            onClick={() => window.location.reload()}
            style={{
              background: "transparent",
              color: "#667eea",
              border: "2px solid #667eea",
              padding: "0.75rem 1.5rem",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "500",
              transition: "all 0.3s",
            }}
            onMouseOver={(e) => {
              e.target.style.background = "#667eea";
              e.target.style.color = "white";
            }}
            onMouseOut={(e) => {
              e.target.style.background = "transparent";
              e.target.style.color = "#667eea";
            }}
          >
            🔄 Tentar novamente
          </button>
        </div>

        <p
          style={{
            color: "#999",
            fontSize: "0.8rem",
            marginTop: "2rem",
            marginBottom: 0,
          }}
        >
          Problemas para acessar? Entre em contato conosco.
        </p>
      </div>
    </div>
  );
}

export default function VerifyRequest() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          }}
        >
          <div style={{ color: "white", fontSize: "1.2rem" }}>
            Carregando...
          </div>
        </div>
      }
    >
      <VerifyRequestContent />
    </Suspense>
  );
}
