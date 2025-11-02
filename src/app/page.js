"use client";

import { signIn, useSession } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";

export default function Home() {
  const { data: session } = useSession();
  const [email, setEmail] = useState("");

  if (session) {
    // Redirecionar para seleção de localização se logado
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <h1>Bem-vindo ao Guarda Memória!</h1>
        <p>Você está logado. Escolha sua cidade para começar.</p>
        <Link href="/selecionar-localizacao">
          <button
            style={{
              padding: "12px 24px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            Selecionar Cidade
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "24px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Header */}
      <header style={{ textAlign: "center", marginBottom: "40px" }}>
        <h1 style={{ fontSize: "48px", color: "#333" }}>Guarda Memória</h1>
        <p style={{ fontSize: "20px", color: "#666" }}>
          Preservando histórias de pessoas que marcaram nossas cidades
        </p>
      </header>

      {/* Seção Principal */}
      <section style={{ marginBottom: "40px" }}>
        <h2>O que é o Guarda Memória?</h2>
        <p>
          Em todas as cidades existem pessoas que estão na memória dos
          residentes. São pessoas comuns que se tornam ícones locais, mas que a
          nova geração pode não conhecer ou dar valor se não souber da história.
        </p>
        <p>
          O Guarda Memória é um site estilo rede social dedicado a preservar e
          compartilhar essas histórias. Aqui, você pode indicar pessoas
          conhecidas, votar nas mais lembradas e contribuir com comentários e
          materiais.
        </p>
        <p>
          Cada cidade tem seu próprio ranking e pódio, promovendo a conexão
          intergeracional através de memórias compartilhadas.
        </p>
      </section>

      {/* Regras */}
      <section
        style={{
          marginBottom: "40px",
          backgroundColor: "#f8f9fa",
          padding: "20px",
          borderRadius: "8px",
        }}
      >
        <h2>Regras e Responsabilidades</h2>
        <ul>
          <li>
            Seja respeitoso: Não publique conteúdo ofensivo, discriminatório ou
            falso.
          </li>
          <li>
            Identificação: Todas as ações são identificadas com seu usuário.
          </li>
          <li>
            Privacidade: Não compartilhe informações pessoais sem consentimento.
          </li>
          <li>Moderação: Denúncias serão revisadas por administradores.</li>
          <li>
            <strong>Responsabilidade:</strong> Tudo que você fizer é sua
            responsabilidade. O site não se responsabiliza por conteúdos
            publicados.
          </li>
        </ul>
      </section>

      {/* Login */}
      <section style={{ textAlign: "center" }}>
        <h2>Entre e Comece a Contribuir</h2>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <button
            onClick={() => signIn("google")}
            style={{
              padding: "12px 24px",
              backgroundColor: "#4285f4",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            Entrar com Google
          </button>

          <div style={{ width: "100%", maxWidth: "300px" }}>
            <hr style={{ margin: "20px 0" }} />
            <form
              onSubmit={(e) => {
                e.preventDefault();
                signIn("email", { email });
              }}
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <label>
                Entrar por email (magic link):
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  style={{
                    padding: "8px",
                    border: "1px solid #ccc",
                    borderRadius: 4,
                    width: "100%",
                  }}
                />
              </label>
              <button
                type="submit"
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                }}
              >
                Enviar Link
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ textAlign: "center", marginTop: "40px", color: "#666" }}>
        <p>
          &copy; 2025 Guarda Memória. Criado para preservar memórias locais.
        </p>
      </footer>
    </div>
  );
}
