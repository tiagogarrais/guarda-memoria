"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminDenuncias() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [denuncias, setDenuncias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/");
      return;
    }
    // Verificar se é admin (temporário, checar email)
    const ADMIN_EMAILS = ["admin@guarda-memoria.com"];
    if (!ADMIN_EMAILS.includes(session.user.email)) {
      router.push("/");
      return;
    }
    fetchDenuncias();
  }, [session, status, router]);

  const fetchDenuncias = async () => {
    try {
      const response = await fetch("/api/denuncias");
      if (!response.ok) throw new Error("Erro ao buscar denúncias");
      const data = await response.json();
      setDenuncias(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await fetch(`/api/denuncias/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error || "Erro ao atualizar status");
        return;
      }
      alert("Status atualizado!");
      fetchDenuncias(); // Recarregar
    } catch (err) {
      alert("Erro ao atualizar status");
    }
  };

  if (status === "loading" || loading) {
    return <div>Carregando...</div>;
  }

  if (error) return <div>Erro: {error}</div>;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px" }}>
      <h1>Gerenciar Denúncias</h1>
      {denuncias.length === 0 ? (
        <p>Nenhuma denúncia pendente.</p>
      ) : (
        <div>
          {denuncias.map((denuncia) => (
            <div
              key={denuncia.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "16px",
                marginBottom: "16px",
              }}
            >
              <h3>Denúncia sobre: {denuncia.pessoa.nome}</h3>
              <p>
                <strong>Denunciado por:</strong> {denuncia.usuario.name} (
                {denuncia.usuario.email})
              </p>
              <p>
                <strong>Motivo:</strong> {denuncia.motivo}
              </p>
              <p>
                <strong>Descrição:</strong> {denuncia.descricao || "Nenhuma"}
              </p>
              <p>
                <strong>Status:</strong> {denuncia.status}
              </p>
              <p>
                <strong>Data:</strong>{" "}
                {new Date(denuncia.createdAt).toLocaleString()}
              </p>
              <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
                {denuncia.status === "pendente" && (
                  <>
                    <button
                      onClick={() =>
                        handleStatusChange(denuncia.id, "resolvida")
                      }
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#28a745",
                        color: "white",
                        border: "none",
                        borderRadius: 4,
                        cursor: "pointer",
                      }}
                    >
                      Marcar como Resolvida
                    </button>
                    <button
                      onClick={() =>
                        handleStatusChange(denuncia.id, "rejeitada")
                      }
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#6c757d",
                        color: "white",
                        border: "none",
                        borderRadius: 4,
                        cursor: "pointer",
                      }}
                    >
                      Rejeitar
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
