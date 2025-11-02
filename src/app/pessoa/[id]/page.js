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
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadType, setUploadType] = useState("foto");
  const [uploading, setUploading] = useState(false);
  const [medias, setMedias] = useState([]);
  const [jaCurtiu, setJaCurtiu] = useState(false);

  useEffect(() => {
    if (!session) {
      router.push("/");
      return;
    }
    if (id) {
      fetchPessoa();
      fetchComentarios();
      verificarInteracoes();
      fetchMedias();
    }
  }, [session, id, router]);

  const verificarInteracoes = async () => {
    if (!session?.user?.id) return;

    try {
      // Primeiro buscar o ID do usuário na tabela Usuario
      const usuarioResponse = await fetch(`/api/profile`);
      if (!usuarioResponse.ok) return;

      const usuario = await usuarioResponse.json();

      // Verificar se já curtiu
      const curtidaResponse = await fetch(
        `/api/curtidas?usuarioId=${usuario.id}&pessoaId=${id}`
      );
      if (curtidaResponse.ok) {
        const curtidas = await curtidaResponse.json();
        setJaCurtiu(curtidas.length > 0);
      }
    } catch (err) {
      console.error("Erro ao verificar interações:", err);
    }
  };

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

  const fetchMedias = async () => {
    try {
      const response = await fetch(`/api/medias?pessoaId=${id}`);
      if (response.ok) {
        const data = await response.json();
        setMedias(data);
      }
    } catch (err) {
      console.error("Erro ao buscar mídias:", err);
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
      const method = jaCurtiu ? "DELETE" : "POST";
      const response = await fetch("/api/curtidas", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pessoaId: id }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        alert(
          errorData.error ||
            `Erro ao ${jaCurtiu ? "remover curtida" : "curtir"}`
        );
        return;
      }
      setJaCurtiu(!jaCurtiu);
      fetchPessoa(); // Atualizar se necessário
    } catch (err) {
      alert(`Erro ao ${jaCurtiu ? "remover curtida" : "curtir"}`);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("pessoaId", id);
      formData.append("tipo", uploadType);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        credentials: "include", // Importante para enviar cookies de sessão
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error || "Erro no upload");
        return;
      }

      alert("Arquivo enviado com sucesso!");
      setSelectedFile(null);
      fetchMedias(); // Recarregar mídias
    } catch (err) {
      alert("Erro no upload");
    } finally {
      setUploading(false);
    }
  };

  const handleDenunciar = async () => {
    const motivo = prompt("Por que você quer denunciar esta pessoa?");
    if (!motivo || !motivo.trim()) return;

    try {
      const response = await fetch("/api/denuncias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pessoaId: id, motivo: motivo.trim() }),
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
          onClick={handleCurtir}
          style={{
            padding: "8px 16px",
            backgroundColor: jaCurtiu ? "#007bff" : "#dc3545",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          {jaCurtiu ? "Descurtir" : "Curtir"}
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

      {/* Seção de Mídias */}
      <section style={{ marginTop: "40px" }}>
        <h2>Mídias Enviadas</h2>

        {/* Formulário de Upload */}
        <div
          style={{
            marginBottom: 20,
            padding: 20,
            border: "1px solid #ddd",
            borderRadius: 8,
          }}
        >
          <h3>Enviar nova mídia</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div>
              <label>Tipo de arquivo:</label>
              <select
                value={uploadType}
                onChange={(e) => setUploadType(e.target.value)}
                style={{ padding: 8, marginLeft: 10 }}
              >
                <option value="foto">Foto</option>
                <option value="video">Vídeo</option>
                <option value="audio">Áudio</option>
              </select>
            </div>

            <div>
              <input
                type="file"
                accept={
                  uploadType === "foto"
                    ? "image/*"
                    : uploadType === "video"
                    ? "video/*"
                    : "audio/*"
                }
                onChange={(e) => setSelectedFile(e.target.files[0])}
                style={{ padding: 8 }}
              />
            </div>

            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              style={{
                padding: "8px 16px",
                backgroundColor: uploading ? "#ccc" : "#007bff",
                color: "white",
                border: "none",
                borderRadius: 4,
                cursor: uploading ? "not-allowed" : "pointer",
              }}
            >
              {uploading ? "Enviando..." : "Enviar Arquivo"}
            </button>
          </div>
        </div>

        {/* Lista de Mídias */}
        {medias.length === 0 ? (
          <p>Nenhuma mídia enviada ainda.</p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: 20,
            }}
          >
            {medias.map((media) => (
              <div
                key={media.id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: 8,
                  padding: 10,
                  textAlign: "center",
                }}
              >
                {media.tipo === "foto" && (
                  <img
                    src={media.url}
                    alt="Foto enviada"
                    style={{
                      width: "100%",
                      height: 150,
                      objectFit: "cover",
                      borderRadius: 4,
                    }}
                  />
                )}
                {media.tipo === "video" && (
                  <video
                    controls
                    style={{
                      width: "100%",
                      height: 150,
                      borderRadius: 4,
                    }}
                  >
                    <source src={media.url} />
                  </video>
                )}
                {media.tipo === "audio" && (
                  <audio
                    controls
                    style={{
                      width: "100%",
                      borderRadius: 4,
                    }}
                  >
                    <source src={media.url} />
                  </audio>
                )}
                <p style={{ marginTop: 10, fontSize: "12px", color: "#666" }}>
                  {new Date(media.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
