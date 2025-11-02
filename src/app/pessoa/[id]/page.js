"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function PessoaDetalhes() {
  const { id } = useParams();
  const { data: session } = useSession();
  const router = useRouter();

  const [pessoa, setPessoa] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [novoComentario, setNovoComentario] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!session) {
      router.push("/");
      return;
    }
    if (id) {
      fetchPessoa();
      fetchComentarios();
    }
  }, [session, id, router]);

  const fetchPessoa = async () => {
    try {
      // Para detalhes, talvez uma API específica, mas por enquanto, buscar da lista ou criar /api/pessoas/[id]
      // Para MVP, buscar da API geral, mas filtrar.
      // Melhor criar /api/pessoas/[id] GET
      const response = await fetch(`/api/pessoas/${id}`);
      if (!response.ok) throw new Error("Pessoa não encontrada");
      const data = await response.json();
      setPessoa(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchComentarios = async () => {
    try {
      const response = await fetch(`/api/comentarios?pessoaId=${id}`);
      if (!response.ok) throw new Error("Erro ao buscar comentários");
      const data = await response.json();
      setComentarios(data);
    } catch (err) {
      console.error("Erro ao buscar comentários:", err);
    }
  };

  const handleComentario = async (e) => {
    e.preventDefault();
    if (!novoComentario.trim()) return;

    try {
      const response = await fetch("/api/comentarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pessoaId: id, texto: novoComentario }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error || "Erro ao comentar");
        return;
      }
      setNovoComentario("");
      fetchComentarios(); // Recarregar comentários
    } catch (err) {
      alert("Erro ao comentar");
    }
  };

  const handleCurtir = async () => {
    try {
      const response = await fetch("/api/curtidas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pessoaId: id }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error || "Erro ao curtir");
        return;
      }
      alert("Curtida registrada!");
      fetchPessoa(); // Atualizar se necessário
    } catch (err) {
      alert("Erro ao curtir");
    }
  };

  const handleDenunciar = async () => {
    const motivo = prompt(
      "Motivo da denúncia (ex: conteúdo inadequado, spam):"
    );
    if (!motivo) return;
    const descricao = prompt("Descrição adicional (opcional):");

    try {
      const response = await fetch("/api/denuncias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pessoaId: id, motivo, descricao }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error || "Erro ao denunciar");
        return;
      }
      alert("Denúncia enviada com sucesso!");
    } catch (err) {
      alert("Erro ao denunciar");
    }
  };

  if (!session || loading) {
    return <div>Carregando...</div>;
  }

  if (error) return <div>Erro: {error}</div>;
  if (!pessoa) return <div>Pessoa não encontrada</div>;

  return (
    <div
      style={{
        maxWidth: 800,
        margin: "0 auto",
        padding: "24px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>{pessoa.nome}</h1>
      {pessoa.fotoUrl && (
        <img
          src={pessoa.fotoUrl}
          alt={pessoa.nome}
          style={{
            width: "200px",
            height: "200px",
            objectFit: "cover",
            borderRadius: "8px",
          }}
        />
      )}
      <p>
        <strong>História:</strong> {pessoa.historia || "Não informada"}
      </p>
      <p>
        <strong>Data de Nascimento:</strong>{" "}
        {pessoa.dataNascimento
          ? new Date(pessoa.dataNascimento).toLocaleDateString()
          : "Não informada"}
      </p>
      <p>
        <strong>Profissão:</strong> {pessoa.profissao || "Não informada"}
      </p>
      <p>
        <strong>Categoria:</strong> {pessoa.categoria || "Não informada"}
      </p>
      <p>
        <strong>Tags:</strong>{" "}
        {pessoa.tags ? pessoa.tags.join(", ") : "Nenhuma"}
      </p>
      <p>
        <strong>Indicado por:</strong> {pessoa.usuario?.fullName || "Anônimo"}
      </p>

      <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
        <button
          onClick={handleVotar}
          style={{
            padding: "8px 16px",
            backgroundColor: "#ffc107",
            color: "black",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          Votar
        </button>
        <button
          onClick={handleCurtir}
          style={{
            padding: "8px 16px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          Curtir
        </button>
        <button
          onClick={handleDenunciar}
          style={{
            padding: "8px 16px",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          Denunciar
        </button>
      </div>

      <p style={{ color: "red", fontWeight: "bold", marginTop: "20px" }}>
        Tudo que você fizer é sua responsabilidade.
      </p>

      {/* Seção de Comentários */}
      <section style={{ marginTop: "40px" }}>
        <h2>Comentários</h2>
        {comentarios.length === 0 ? (
          <p>Seja o primeiro a comentar!</p>
        ) : (
          <div style={{ marginBottom: "20px" }}>
            {comentarios.map((comentario) => (
              <div
                key={comentario.id}
                style={{
                  padding: "12px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  marginBottom: "10px",
                }}
              >
                <p>
                  <strong>{comentario.usuario?.fullName || "Anônimo"}:</strong>{" "}
                  {comentario.texto}
                </p>
                <small>{new Date(comentario.createdAt).toLocaleString()}</small>
              </div>
            ))}
          </div>
        )}

        <form
          onSubmit={handleComentario}
          style={{ display: "flex", flexDirection: "column", gap: "8px" }}
        >
          <textarea
            value={novoComentario}
            onChange={(e) => setNovoComentario(e.target.value)}
            placeholder="Deixe seu comentário..."
            rows={3}
            required
            style={{
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: 4,
            }}
          />
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
            Comentar
          </button>
        </form>
      </section>

      {/* Placeholder para Mídias */}
      <section style={{ marginTop: "40px" }}>
        <h2>Mídias Enviadas</h2>
        <p>
          Funcionalidade em desenvolvimento. Aqui aparecerão áudios, vídeos e
          outros materiais.
        </p>
      </section>
    </div>
  );
}
