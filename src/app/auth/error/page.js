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
      case "OAuthAccountNotLinked":
        return "Esta conta de email já está cadastrada com outro método de login. Tente fazer login com email ou entre em contato com o suporte.";
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

        {error === "OAuthAccountNotLinked" && (
          <div style={{ marginBottom: "20px", padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "4px", textAlign: "left" }}>
            <h3 style={{ margin: "0 0 10px 0", color: "#495057", fontSize: "16px" }}>
              Como resolver:
            </h3>
            <ul style={{ margin: 0, paddingLeft: "20px", color: "#6c757d", fontSize: "14px" }}>
              <li>Se você já tem uma conta criada por email, faça login usando o email primeiro</li>
              <li>Ou use uma conta Google diferente que não esteja vinculada a outro usuário</li>
              <li>Entre em contato com o suporte se precisar de ajuda</li>
            </ul>
          </div>
        )}

        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
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
          
          {error === "OAuthAccountNotLinked" && (
            <Link
              href="/auth/signin?method=email"
              style={{
                display: "inline-block",
                padding: "12px 24px",
                backgroundColor: "#28a745",
                color: "white",
                textDecoration: "none",
                borderRadius: "4px",
                fontWeight: "500",
              }}
            >
              Login por Email
            </Link>
          )}
        </div>
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
