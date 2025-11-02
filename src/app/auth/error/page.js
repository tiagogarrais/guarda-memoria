"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const getErrorMessage = (error) => {
    switch (error) {
      case "Configuration":
        return "Há um problema na configuração do servidor.";
      case "AccessDenied":
        return "Acesso negado. Você cancelou o processo de autenticação.";
      case "Verification":
        return "O link de verificação pode ter expirado ou já foi usado.";
      default:
        return "Ocorreu um erro durante a autenticação.";
    }
  };

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
        <h1 style={{ marginBottom: "20px", color: "#dc3545" }}>
          Erro de Autenticação
        </h1>

        <p style={{ marginBottom: "30px", color: "#666" }}>
          {getErrorMessage(error)}
        </p>

        <Link
          href="/auth/signin"
          style={{
            display: "inline-block",
            padding: "12px 24px",
            backgroundColor: "#007bff",
            color: "white",
            textDecoration: "none",
            borderRadius: "4px",
            fontWeight: "500",
          }}
        >
          Tentar Novamente
        </Link>
      </div>
    </div>
  );
}

export default function AuthError() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <AuthErrorContent />
    </Suspense>
  );
}
