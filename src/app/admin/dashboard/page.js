"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/");
      return;
    }
    const ADMIN_EMAILS = ["admin@guarda-memoria.com"];
    if (!ADMIN_EMAILS.includes(session.user.email)) {
      router.push("/");
      return;
    }
    fetchStats();
  }, [session, status, router]);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats");
      if (!response.ok) throw new Error("Erro ao buscar estatísticas");
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return <div>Carregando...</div>;
  }

  if (error) return <div>Erro: {error}</div>;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px" }}>
      <h1>Dashboard Administrativo</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px",
          marginBottom: "40px",
        }}
      >
        <div
          style={{
            border: "1px solid #ddd",
            padding: "16px",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          <h3>Total de Pessoas</h3>
          <p style={{ fontSize: "2em", fontWeight: "bold" }}>
            {stats.totalPessoas}
          </p>
        </div>
        <div
          style={{
            border: "1px solid #ddd",
            padding: "16px",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          <h3>Total de Comentários</h3>
          <p style={{ fontSize: "2em", fontWeight: "bold" }}>
            {stats.totalComentarios}
          </p>
        </div>
        <div
          style={{
            border: "1px solid #ddd",
            padding: "16px",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          <h3>Total de Votações</h3>
          <p style={{ fontSize: "2em", fontWeight: "bold" }}>
            {stats.totalVotacoes}
          </p>
        </div>
        <div
          style={{
            border: "1px solid #ddd",
            padding: "16px",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          <h3>Total de Curtidas</h3>
          <p style={{ fontSize: "2em", fontWeight: "bold" }}>
            {stats.totalCurtidas}
          </p>
        </div>
        <div
          style={{
            border: "1px solid #ddd",
            padding: "16px",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          <h3>Total de Denúncias</h3>
          <p style={{ fontSize: "2em", fontWeight: "bold" }}>
            {stats.totalDenuncias}
          </p>
        </div>
        <div
          style={{
            border: "1px solid #ddd",
            padding: "16px",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          <h3>Denúncias Pendentes</h3>
          <p
            style={{
              fontSize: "2em",
              fontWeight: "bold",
              color: stats.denunciasPendentes > 0 ? "red" : "green",
            }}
          >
            {stats.denunciasPendentes}
          </p>
        </div>
      </div>

      <h2>Atividade Recente (últimos 30 dias)</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px",
          marginBottom: "40px",
        }}
      >
        <div
          style={{
            border: "1px solid #ddd",
            padding: "16px",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          <h3>Novas Pessoas</h3>
          <p style={{ fontSize: "2em", fontWeight: "bold" }}>
            {stats.atividadeRecente.novasPessoas}
          </p>
        </div>
        <div
          style={{
            border: "1px solid #ddd",
            padding: "16px",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          <h3>Novos Comentários</h3>
          <p style={{ fontSize: "2em", fontWeight: "bold" }}>
            {stats.atividadeRecente.novosComentarios}
          </p>
        </div>
      </div>

      <h2>Top 10 Cidades por Número de Pessoas</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#f8f9fa" }}>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Cidade</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Estado</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>
              Número de Pessoas
            </th>
          </tr>
        </thead>
        <tbody>
          {stats.topCidades.map((cidade, index) => (
            <tr key={index}>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                {cidade.cidade}
              </td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                {cidade.estado}
              </td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                {cidade.count}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: "40px" }}>
        <button
          onClick={() => router.push("/admin/denuncias")}
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
          Gerenciar Denúncias
        </button>
      </div>
    </div>
  );
}
