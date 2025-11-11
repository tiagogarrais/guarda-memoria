"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function EntidadeDetalhes() {
  const { id } = useParams();
  const { data: session } = useSession();
  const router = useRouter();

  const [entidade, setEntidade] = useState(null);
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
      fetchEntidade();
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
        `/api/curtidas?usuarioId=${usuario.id}&entidadeId=${id}`
      );
      if (curtidaResponse.ok) {
        const curtidas = await curtidaResponse.json();
        setJaCurtiu(curtidas.length > 0);
      }
    } catch (err) {
      console.error("Erro ao verificar interações:", err);
    }
  };

  const fetchEntidade = async () => {
    try {
      const response = await fetch(`/api/entidades/${id}`);
      if (!response.ok) throw new Error("Entidade não encontrada");
      const data = await response.json();
      setEntidade(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchComentarios = async () => {
    try {
      const response = await fetch(`/api/comentarios?entidadeId=${id}`);
      if (!response.ok) throw new Error("Erro ao buscar comentários");
      const data = await response.json();
      setComentarios(data);
    } catch (err) {
      console.error("Erro ao buscar comentários:", err);
    }
  };

  const fetchMedias = async () => {
    try {
      const response = await fetch(`/api/medias?entidadeId=${id}`);
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
        body: JSON.stringify({ entidadeId: id, texto: novoComentario }),
      });

      if (!response.ok) throw new Error("Erro ao enviar comentário");

      setNovoComentario("");
      fetchComentarios(); // Recarregar comentários
    } catch (err) {
      alert("Erro ao enviar comentário: " + err.message);
    }
  };

  const handleCurtida = async () => {
    try {
      const method = jaCurtiu ? "DELETE" : "POST";
      const response = await fetch("/api/curtidas", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entidadeId: id }),
      });

      if (!response.ok) throw new Error("Erro ao curtir/descurtir");

      setJaCurtiu(!jaCurtiu);
      fetchEntidade(); // Recarregar dados da entidade
    } catch (err) {
      alert("Erro: " + err.message);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("entidadeId", id);
      formData.append("tipo", uploadType);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Erro no upload");

      const data = await response.json();

      // Salvar referência no banco
      const mediaResponse = await fetch("/api/medias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entidadeId: id,
          tipo: uploadType,
          url: data.url,
        }),
      });

      if (!mediaResponse.ok) throw new Error("Erro ao salvar mídia");

      setSelectedFile(null);
      fetchMedias(); // Recarregar mídias
      fetchEntidade(); // Recarregar contadores
    } catch (err) {
      alert("Erro no upload: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case "PESSOA":
        return "👤";
      case "LUGAR":
        return "📍";
      case "DATA":
        return "📅";
      case "EVENTO":
        return "🎉";
      case "OBRA_ARTE":
        return "🎨";
      case "COLETIVO_ORGANIZADO":
        return "👥";
      default:
        return "📄";
    }
  };

  const getTipoLabel = (tipo) => {
    switch (tipo) {
      case "PESSOA":
        return "Pessoa";
      case "LUGAR":
        return "Lugar";
      case "DATA":
        return "Data";
      case "EVENTO":
        return "Evento";
      case "OBRA_ARTE":
        return "Obra de Arte";
      case "COLETIVO_ORGANIZADO":
        return "Coletivo Organizado";
      default:
        return tipo;
    }
  };

  const getEstadoNome = (codigoEstado) => {
    const estados = {
      11: "Rondônia",
      12: "Acre",
      13: "Amazonas",
      14: "Roraima",
      15: "Pará",
      16: "Amapá",
      17: "Tocantins",
      21: "Maranhão",
      22: "Piauí",
      23: "Ceará",
      24: "Rio Grande do Norte",
      25: "Paraíba",
      26: "Pernambuco",
      27: "Alagoas",
      28: "Sergipe",
      29: "Bahia",
      31: "Minas Gerais",
      32: "Espírito Santo",
      33: "Rio de Janeiro",
      35: "São Paulo",
      41: "Paraná",
      42: "Santa Catarina",
      43: "Rio Grande do Sul",
      50: "Mato Grosso do Sul",
      51: "Mato Grosso",
      52: "Goiás",
      53: "Distrito Federal",
    };
    return estados[codigoEstado] || codigoEstado;
  };
  if (!session) return <div>Carregando...</div>;
  if (loading) return <div>Carregando entidade...</div>;
  if (error) return <div>Erro: {error}</div>;
  if (!entidade) return <div>Entidade não encontrada</div>;

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "24px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Header da Entidade */}
      <div
        style={{
          backgroundColor: "white",
          border: "1px solid #ddd",
          borderRadius: "12px",
          padding: "24px",
          marginBottom: "24px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          {entidade.fotoUrl && (
            <img
              src={entidade.fotoUrl}
              alt={entidade.nome}
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                objectFit: "cover",
                marginRight: "16px",
              }}
            />
          )}
          <div>
            <h1 style={{ margin: 0, fontSize: "28px" }}>
              <span style={{ marginRight: "12px" }}>
                {getTipoIcon(entidade.tipo)}
              </span>
              {entidade.nome}
            </h1>
            <p style={{ margin: "4px 0", color: "#666" }}>
              {getTipoLabel(entidade.tipo)} • {entidade.cidade.nome},{" "}
              {getEstadoNome(entidade.cidade.estado)}
            </p>
            <p style={{ margin: "4px 0", color: "#666", fontSize: "14px" }}>
              Registrado por {entidade.usuario.fullName}
            </p>
          </div>
        </div>

        {/* Informações específicas por tipo */}
        <div style={{ marginBottom: "16px" }}>
          {entidade.tipo === "PESSOA" && entidade.dataNascimento && (
            <p>
              <strong>Data de nascimento:</strong>{" "}
              {new Date(entidade.dataNascimento).toLocaleDateString("pt-BR")}
            </p>
          )}
          {entidade.tipo === "PESSOA" && entidade.profissao && (
            <p>
              <strong>Profissão:</strong> {entidade.profissao}
            </p>
          )}
          {entidade.tipo === "LUGAR" && entidade.localizacao && (
            <p>
              <strong>Localização:</strong> {entidade.localizacao}
            </p>
          )}
          {entidade.tipo === "DATA" && entidade.dataRelacionada && (
            <p>
              <strong>Data:</strong>{" "}
              {new Date(entidade.dataRelacionada).toLocaleDateString("pt-BR")}
            </p>
          )}
          {entidade.tipo === "EVENTO" && entidade.dataInicio && (
            <p>
              <strong>Data de início:</strong>{" "}
              {new Date(entidade.dataInicio).toLocaleDateString("pt-BR")}
            </p>
          )}
          {entidade.tipo === "EVENTO" && entidade.dataFim && (
            <p>
              <strong>Data de fim:</strong>{" "}
              {new Date(entidade.dataFim).toLocaleDateString("pt-BR")}
            </p>
          )}
          {entidade.tipo === "OBRA_ARTE" && entidade.artista && (
            <p>
              <strong>Artista:</strong> {entidade.artista}
            </p>
          )}
          {entidade.tipo === "OBRA_ARTE" && entidade.anoCriacao && (
            <p>
              <strong>Ano de criação:</strong> {entidade.anoCriacao}
            </p>
          )}
          {entidade.tipo === "OBRA_ARTE" && entidade.tecnica && (
            <p>
              <strong>Técnica:</strong> {entidade.tecnica}
            </p>
          )}
          {entidade.tipo === "COLETIVO_ORGANIZADO" &&
            entidade.membrosPrincipais && (
              <p>
                <strong>Membros principais:</strong>{" "}
                {JSON.parse(entidade.membrosPrincipais).join(", ")}
              </p>
            )}
          {entidade.tipo === "COLETIVO_ORGANIZADO" && entidade.dataFormacao && (
            <p>
              <strong>Data de formação:</strong>{" "}
              {new Date(entidade.dataFormacao).toLocaleDateString("pt-BR")}
            </p>
          )}
          {entidade.tipo === "COLETIVO_ORGANIZADO" && entidade.tipoColetivo && (
            <p>
              <strong>Tipo de coletivo:</strong> {entidade.tipoColetivo}
            </p>
          )}
          {entidade.categoria && (
            <p>
              <strong>Categoria:</strong> {entidade.categoria}
            </p>
          )}
        </div>

        {entidade.descricao && (
          <div style={{ marginBottom: "16px" }}>
            <h3>História</h3>
            <p style={{ lineHeight: 1.6 }}>{entidade.descricao}</p>
          </div>
        )}

        {/* Estatísticas e Ações */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ fontSize: "18px" }}>
            <span style={{ marginRight: "20px" }}>
              ❤️ {entidade._count.curtidas}
            </span>
            <span style={{ marginRight: "20px" }}>
              💬 {entidade._count.comentarios}
            </span>
            <span>📎 {entidade._count.medias}</span>
          </div>

          <div>
            <button
              onClick={handleCurtida}
              style={{
                padding: "8px 16px",
                backgroundColor: jaCurtiu ? "#dc3545" : "#28a745",
                color: "white",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
                marginRight: "8px",
              }}
            >
              {jaCurtiu ? "Descurtir" : "Curtir"}
            </button>

            <button
              onClick={() => {
                /* TODO: implementar denúncia */
              }}
              style={{
                padding: "8px 16px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
              }}
            >
              Denunciar
            </button>
          </div>
        </div>
      </div>

      {/* Mídias */}
      {medias.length > 0 && (
        <div style={{ marginBottom: "24px" }}>
          <h2>Mídias</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: "16px",
            }}
          >
            {medias.map((media) => (
              <div
                key={media.id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  overflow: "hidden",
                }}
              >
                {media.tipo === "foto" && (
                  <img
                    src={media.url}
                    alt="Mídia"
                    style={{
                      width: "100%",
                      height: "150px",
                      objectFit: "cover",
                    }}
                  />
                )}
                {media.tipo === "video" && (
                  <video
                    src={media.url}
                    controls
                    style={{ width: "100%", height: "150px" }}
                  />
                )}
                {media.tipo === "audio" && (
                  <audio src={media.url} controls style={{ width: "100%" }} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Arquivo da Obra de Arte */}
      {entidade.tipo === "OBRA_ARTE" && entidade.arquivoUrl && (
        <div style={{ marginBottom: "24px" }}>
          <h2>Obra de Arte</h2>
          <div
            style={{
              backgroundColor: "white",
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "16px",
            }}
          >
            {entidade.tipoArquivo === "imagem" && (
              <div>
                <img
                  src={entidade.arquivoUrl}
                  alt={entidade.nome}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "400px",
                    borderRadius: "8px",
                  }}
                />
              </div>
            )}
            {entidade.tipoArquivo === "audio" && (
              <div>
                <audio
                  src={entidade.arquivoUrl}
                  controls
                  style={{ width: "100%" }}
                />
              </div>
            )}
            {entidade.tipoArquivo === "video" && (
              <div>
                <video
                  src={entidade.arquivoUrl}
                  controls
                  style={{ maxWidth: "100%", maxHeight: "400px" }}
                />
              </div>
            )}
            {(entidade.tipoArquivo === "documento" ||
              !["imagem", "audio", "video"].includes(entidade.tipoArquivo)) && (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <p style={{ marginBottom: "16px" }}>
                  📄 {entidade.nomeArquivo || "Documento"}
                  {entidade.tamanhoArquivo && (
                    <span style={{ color: "#666", fontSize: "14px" }}>
                      {" "}
                      ({(entidade.tamanhoArquivo / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  )}
                </p>
                <a
                  href={entidade.arquivoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: "12px 24px",
                    backgroundColor: "#007bff",
                    color: "white",
                    textDecoration: "none",
                    borderRadius: 4,
                    display: "inline-block",
                  }}
                >
                  📥 Baixar Arquivo
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upload de Mídia */}
      <div style={{ marginBottom: "24px" }}>
        <h3>Adicionar Mídia</h3>
        <form
          onSubmit={handleUpload}
          style={{ display: "flex", gap: "8px", alignItems: "center" }}
        >
          <select
            value={uploadType}
            onChange={(e) => setUploadType(e.target.value)}
            style={{
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: 4,
            }}
          >
            <option value="foto">Foto</option>
            <option value="video">Vídeo</option>
            <option value="audio">Áudio</option>
          </select>
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
            style={{ padding: "8px" }}
          />
          <button
            type="submit"
            disabled={!selectedFile || uploading}
            style={{
              padding: "8px 16px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            {uploading ? "Enviando..." : "Enviar"}
          </button>
        </form>
      </div>

      {/* Comentários */}
      <div>
        <h2>Comentários</h2>

        {/* Formulário de comentário */}
        <form onSubmit={handleComentario} style={{ marginBottom: "24px" }}>
          <textarea
            value={novoComentario}
            onChange={(e) => setNovoComentario(e.target.value)}
            placeholder="Escreva um comentário..."
            rows={3}
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid #ccc",
              borderRadius: 4,
              resize: "vertical",
            }}
          />
          <button
            type="submit"
            style={{
              marginTop: "8px",
              padding: "8px 16px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            Comentar
          </button>
        </form>

        {/* Lista de comentários */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {comentarios.map((comentario) => (
            <div
              key={comentario.id}
              style={{
                backgroundColor: "white",
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                {comentario.usuario.fotoPerfilUrl && (
                  <img
                    src={comentario.usuario.fotoPerfilUrl}
                    alt={comentario.usuario.fullName}
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      marginRight: "8px",
                    }}
                  />
                )}
                <div>
                  <strong>{comentario.usuario.fullName}</strong>
                  <span
                    style={{
                      color: "#666",
                      fontSize: "14px",
                      marginLeft: "8px",
                    }}
                  >
                    {new Date(comentario.createdAt).toLocaleString("pt-BR")}
                  </span>
                </div>
              </div>
              <p style={{ margin: 0 }}>{comentario.texto}</p>
            </div>
          ))}
        </div>

        {comentarios.length === 0 && (
          <p style={{ color: "#666", fontStyle: "italic" }}>
            Nenhum comentário ainda. Seja o primeiro!
          </p>
        )}
      </div>
    </div>
  );
}
