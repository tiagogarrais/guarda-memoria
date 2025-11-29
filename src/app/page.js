"use client";

import { signIn, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";

export default function Home() {
  const { data: session } = useSession();
  const [email, setEmail] = useState("");
  const [cidadeSelecionada, setCidadeSelecionada] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Verificar se há cidade selecionada no localStorage
    const cidadeSalva = localStorage.getItem("cidadeSelecionada");
    if (cidadeSalva) {
      try {
        const cidade = JSON.parse(cidadeSalva);
        setCidadeSelecionada(cidade);
      } catch (error) {
        console.error("Erro ao parsear cidade salva:", error);
        localStorage.removeItem("cidadeSelecionada");
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // Se usuário está logado e tem cidade selecionada, redirecionar para entidades
    if (session && cidadeSelecionada && !loading) {
      router.push(`/entidades?cidadeId=${cidadeSelecionada.id}`);
    }
  }, [session, cidadeSelecionada, loading, router]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <p>Carregando...</p>
      </div>
    );
  }

  if (session) {
    // Se tem cidade selecionada, já redirecionou no useEffect
    // Se não tem, mostrar opção de selecionar
    if (!cidadeSelecionada) {
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
          <SiteHeader />

          <div style={{ textAlign: "center", padding: "50px 0" }}>
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
        </div>
      );
    }

    // Este código não deve ser alcançado devido ao redirecionamento no useEffect
    return null;
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
          Preservando histórias de pessoas, lugares, datas, eventos e obras de
          arte que marcaram nossas cidades
        </p>
      </header>

      {/* Seção Principal */}
      <section style={{ marginBottom: "40px" }}>
        <h2>O que é o Guarda Memória?</h2>
        <p>
          Em todas as cidades existem pessoas, lugares, datas, eventos e obras
          de arte que estão na memória dos residentes. São pessoas comuns que se
          tornam ícones locais, lugares históricos, datas importantes, eventos
          marcantes ou obras artísticas que representam a cultura local, mas que
          a nova geração pode não conhecer ou dar valor se não souber da
          história.
        </p>
        <p>
          O Guarda Memória é um site estilo rede social dedicado a preservar e
          compartilhar essas histórias. Aqui, você pode registrar pessoas,
          lugares, datas, eventos e obras de arte conhecidos, curtir os mais
          lembrados e contribuir com comentários e materiais.
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
        <h2>Regras</h2>
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
          <input
            type="email"
            placeholder="Digite seu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              padding: "12px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              width: "300px",
              fontSize: "16px",
            }}
          />
          <button
            onClick={() => signIn("email", { email })}
            style={{
              padding: "12px 24px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            Receber link mágico
          </button>
          <Link href="/auth/signin">
            <button
              style={{
                padding: "12px 24px",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              Entrar
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
