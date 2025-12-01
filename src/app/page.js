"use client";

import { signIn, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import HomeHeader from "@/components/HomeHeader";
import { useCurrentCity, useCityNavigation } from "@/contexts/CityContext";

export default function Home() {
  const { data: session } = useSession();
  const { currentCity, loading: cityLoading } = useCurrentCity();
  const { navigateToCity } = useCityNavigation();
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setLoading(false);
  }, []);

  useEffect(() => {
    // Se usuário está logado e tem cidade atual (via URL), redirecionar para as memórias da cidade
    if (session && currentCity && !loading && !cityLoading) {
      router.push(`/memorias/${currentCity.slug}`);
    }
  }, [session, currentCity, loading, cityLoading, router]);

  if (loading || cityLoading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <p>Carregando...</p>
      </div>
    );
  }

  if (session) {
    // Se tem cidade atual, já redirecionou no useEffect
    // Se não tem, mostrar opção de selecionar
    if (!currentCity) {
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
        minHeight: "100vh",
        background: "linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%)",
      }}
    >
      {/* Novo Header com área de login */}
      <HomeHeader />

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 2rem 3rem 2rem",
          fontFamily: "Arial, sans-serif",
        }}
      >
        {/* Seção Principal */}
        <section
          style={{
            marginBottom: "3rem",
            background: "white",
            padding: "2.5rem",
            borderRadius: "12px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
          }}
        >
          <h2
            style={{
              color: "#333",
              fontSize: "2rem",
              marginBottom: "1.5rem",
              textAlign: "center",
              fontWeight: "600",
            }}
          >
            O que é o Guarda Memória?
          </h2>

          <div style={{ fontSize: "1.1rem", lineHeight: 1.7, color: "#555" }}>
            <p style={{ marginBottom: "1.5rem" }}>
              Em todas as cidades existem pessoas, lugares, datas, eventos e
              obras de arte que estão na memória dos residentes. São pessoas
              comuns que se tornam ícones locais, lugares históricos, datas
              importantes, eventos marcantes ou obras artísticas que representam
              a cultura local, mas que a nova geração pode não conhecer ou dar
              valor se não souber da história.
            </p>
            <p style={{ marginBottom: "1.5rem" }}>
              O Guarda Memória é um site estilo rede social dedicado a preservar
              e compartilhar essas histórias. Aqui, você pode registrar pessoas,
              lugares, datas, eventos e obras de arte conhecidos, curtir os mais
              lembrados e contribuir com comentários e materiais.
            </p>
            <p style={{ margin: 0 }}>
              Cada cidade tem seu próprio ranking e pódio, promovendo a conexão
              intergeracional através de memórias compartilhadas.
            </p>
          </div>
        </section>

        {/* Cards com benefícios */}
        <section style={{ marginBottom: "3rem" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "2rem",
            }}
          >
            <div
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                padding: "2rem",
                borderRadius: "12px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✨</div>
              <h3 style={{ marginBottom: "1rem", fontSize: "1.3rem" }}>
                Preserve Memórias
              </h3>
              <p style={{ fontSize: "1rem", opacity: 0.9, margin: 0 }}>
                Registre pessoas, lugares e eventos que marcaram sua cidade
              </p>
            </div>

            <div
              style={{
                background: "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
                color: "white",
                padding: "2rem",
                borderRadius: "12px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🏛️</div>
              <h3 style={{ marginBottom: "1rem", fontSize: "1.3rem" }}>
                Conecte Gerações
              </h3>
              <p style={{ fontSize: "1rem", opacity: 0.9, margin: 0 }}>
                Una o conhecimento dos mais velhos com a curiosidade dos jovens
              </p>
            </div>

            <div
              style={{
                background: "linear-gradient(135deg, #007bff 0%, #0056b3 100%)",
                color: "white",
                padding: "2rem",
                borderRadius: "12px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🌟</div>
              <h3 style={{ marginBottom: "1rem", fontSize: "1.3rem" }}>
                Valorize sua Cultura
              </h3>
              <p style={{ fontSize: "1rem", opacity: 0.9, margin: 0 }}>
                Dê destaque ao patrimônio histórico e cultural local
              </p>
            </div>
          </div>
        </section>

        {/* Regras */}
        <section
          style={{
            background: "white",
            padding: "2.5rem",
            borderRadius: "12px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
            border: "1px solid #e9ecef",
          }}
        >
          <h2
            style={{
              color: "#333",
              fontSize: "1.8rem",
              marginBottom: "1.5rem",
              textAlign: "center",
              fontWeight: "600",
            }}
          >
            📋 Regras da Comunidade
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "1.5rem",
              fontSize: "1rem",
              lineHeight: 1.6,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "1rem",
                padding: "1rem",
                background: "#f8f9fa",
                borderRadius: "8px",
              }}
            >
              <span style={{ fontSize: "1.5rem" }}>🤝</span>
              <div>
                <strong>Seja respeitoso:</strong> Não publique conteúdo
                ofensivo, discriminatório ou falso.
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "1rem",
                padding: "1rem",
                background: "#f8f9fa",
                borderRadius: "8px",
              }}
            >
              <span style={{ fontSize: "1.5rem" }}>🆔</span>
              <div>
                <strong>Identificação:</strong> Todas as ações são identificadas
                com seu usuário.
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "1rem",
                padding: "1rem",
                background: "#f8f9fa",
                borderRadius: "8px",
              }}
            >
              <span style={{ fontSize: "1.5rem" }}>🔒</span>
              <div>
                <strong>Privacidade:</strong> Não compartilhe informações
                pessoais sem consentimento.
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "1rem",
                padding: "1rem",
                background: "#f8f9fa",
                borderRadius: "8px",
              }}
            >
              <span style={{ fontSize: "1.5rem" }}>⚖️</span>
              <div>
                <strong>Moderação:</strong> Denúncias serão revisadas por
                administradores.
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
