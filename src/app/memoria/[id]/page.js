"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import SiteHeader from "@/components/SiteHeader";

// Adicionar estilos globais para animações
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = `
    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.5; }
      100% { opacity: 1; }
    }
  `;
  document.head.appendChild(style);
}

export default function MemoriaDetalhes() {
  const { id } = useParams();
  const { data: session } = useSession();
  const router = useRouter();

  const [memoria, setMemoria] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [novoComentario, setNovoComentario] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [medias, setMedias] = useState([]);
  const [jaCurtiu, setJaCurtiu] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const [comentarioMediaType, setComentarioMediaType] = useState(null);
  const [comentarioFile, setComentarioFile] = useState(null);
  const [enviandoComentario, setEnviandoComentario] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);

  useEffect(() => {
    if (!session) {
      router.push("/");
      return;
    }
    if (id && id.trim()) {
      fetchMemoria();
      fetchComentarios();
      verificarInteracoes();
      fetchMedias();
    } else {
      setError("ID da memória inválido");
      setLoading(false);
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
        `/api/curtidas?usuarioId=${usuario.id}&memoriaId=${id}`
      );
      if (curtidaResponse.ok) {
        const curtidas = await curtidaResponse.json();
        setJaCurtiu(curtidas.length > 0);
      }
    } catch (err) {
      console.error("Erro ao verificar interações:", err);
    }
  };

  const fetchMemoria = async () => {
    try {
      const response = await fetch(`/api/memorias/${id}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Memória não encontrada");
      }

      const data = await response.json();
      setMemoria(data);
    } catch (err) {
      console.error("Erro ao buscar memória:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchComentarios = async () => {
    try {
      const response = await fetch(`/api/comentarios?memoriaId=${id}`);
      if (!response.ok) throw new Error("Erro ao buscar comentários");
      const data = await response.json();
      setComentarios(data);
    } catch (err) {
      console.error("Erro ao buscar comentários:", err);
    }
  };

  const fetchMedias = async () => {
    try {
      const response = await fetch(`/api/medias?memoriaId=${id}`);
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

    // Permitir envio se há texto OU arquivo
    const hasText = novoComentario.trim().length > 0;
    const hasFile = !!comentarioFile;

    if (!hasText && !hasFile) {
      alert(
        "Por favor, digite um comentário ou selecione/anexe um arquivo para enviar."
      );
      return;
    }

    setEnviandoComentario(true);
    try {
      let comentarioData = {
        memoriaId: id,
        texto: hasText ? novoComentario.trim() : null,
      };

      // Se há arquivo, fazer upload primeiro
      if (comentarioFile) {
        const formData = new FormData();
        formData.append("file", comentarioFile);
        formData.append("memoriaId", id);
        formData.append("tipo", comentarioMediaType);

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) throw new Error("Erro no upload da mídia");

        const uploadData = await uploadResponse.json();
        comentarioData.mediaUrl = uploadData.media.url;
        comentarioData.mediaTipo = comentarioMediaType;
      }

      const response = await fetch("/api/comentarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(comentarioData),
      });

      if (!response.ok) throw new Error("Erro ao enviar comentário");

      setNovoComentario("");
      setComentarioFile(null);
      setComentarioMediaType(null);
      setIsRecording(false);
      setMediaRecorder(null);
      setRecordedChunks([]);
      fetchComentarios(); // Recarregar comentários
    } catch (err) {
      alert("Erro ao enviar comentário: " + err.message);
    } finally {
      setEnviandoComentario(false);
    }
  };

  const handleMediaSelect = (type) => {
    setComentarioMediaType(type);
    const input = document.createElement("input");
    input.type = "file";

    let acceptTypes = "";
    switch (type) {
      case "foto":
        acceptTypes = "image/*";
        break;
      case "video":
        acceptTypes = "video/*";
        break;
      case "audio":
        acceptTypes = "audio/*,.mp3,.wav,.ogg,.m4a,.flac";
        break;
      case "documento":
        acceptTypes = ".pdf,.doc,.docx,.txt,.rtf,.odt";
        break;
    }
    input.accept = acceptTypes;

    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        // Validação de tamanho
        const maxSizes = {
          foto: 10 * 1024 * 1024, // 10MB
          video: 100 * 1024 * 1024, // 100MB
          audio: 50 * 1024 * 1024, // 50MB
          documento: 25 * 1024 * 1024, // 25MB
        };

        if (file.size > maxSizes[type]) {
          alert(
            `Arquivo muito grande. Máximo ${
              maxSizes[type] / 1024 / 1024
            }MB para ${type}.`
          );
          return;
        }

        setComentarioFile(file);
      }
    };
    input.click();
  };

  const removeComentarioMedia = () => {
    setComentarioFile(null);
    setComentarioMediaType(null);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: "audio/webm" });
        const audioFile = new File([audioBlob], `audio-${Date.now()}.webm`, {
          type: "audio/webm",
        });

        // Validar tamanho do arquivo gravado (máximo 50MB)
        if (audioFile.size > 50 * 1024 * 1024) {
          alert("Áudio gravado muito grande. Máximo 50MB.");
          // Parar todas as tracks do stream
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        setComentarioFile(audioFile);
        setComentarioMediaType("audio");

        // Parar todas as tracks do stream
        stream.getTracks().forEach((track) => track.stop());
      };

      setMediaRecorder(recorder);
      setRecordedChunks(chunks);
      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Erro ao iniciar gravação:", error);
      alert("Erro ao acessar microfone. Verifique as permissões.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const handleCurtida = async () => {
    try {
      const method = jaCurtiu ? "DELETE" : "POST";
      const response = await fetch("/api/curtidas", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memoriaId: id }),
      });

      if (!response.ok) throw new Error("Erro ao curtir/descurtir");

      setJaCurtiu(!jaCurtiu);
      fetchMemoria(); // Recarregar dados da memoria
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
      formData.append("memoriaId", id);
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
          memoriaId: id,
          tipo: uploadType,
          url: data.url,
        }),
      });

      if (!mediaResponse.ok) throw new Error("Erro ao salvar mídia");

      setSelectedFile(null);
      fetchMedias(); // Recarregar mídias
      fetchMemoria(); // Recarregar contadores
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
  if (loading) return <div>Carregando memoria...</div>;
  if (error) return <div>Erro: {error}</div>;
  if (!memoria) return <div>Memória não encontrada</div>;

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "24px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Header Geral do Site */}
      <SiteHeader />

      {/* Header da Memória */}
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
          {memoria.fotoUrl && (
            <img
              src={memoria.fotoUrl}
              alt={memoria.nome}
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                objectFit: "cover",
                marginRight: "16px",
                cursor: "pointer",
              }}
              onClick={() => {
                setModalImage(memoria.fotoUrl);
                setShowModal(true);
              }}
            />
          )}
          <div>
            <h1 style={{ margin: 0, fontSize: "28px" }}>
              <span style={{ marginRight: "12px" }}>
                {getTipoIcon(memoria.tipo)}
              </span>
              {memoria.nome}
            </h1>
            <p style={{ margin: "4px 0", color: "#666" }}>
              {getTipoLabel(memoria.tipo)} • {memoria.cidade.nome},{" "}
              {getEstadoNome(memoria.cidade.estado)}
            </p>
            <p style={{ margin: "4px 0", color: "#666", fontSize: "14px" }}>
              Registrado por {memoria.usuario.fullName}
            </p>
          </div>
        </div>

        {/* Informações específicas por tipo */}
        <div style={{ marginBottom: "16px" }}>
          {memoria.tipo === "PESSOA" && memoria.dataNascimento && (
            <p>
              <strong>Data de nascimento:</strong>{" "}
              {new Date(memoria.dataNascimento).toLocaleDateString("pt-BR")}
            </p>
          )}
          {memoria.tipo === "PESSOA" && memoria.profissao && (
            <p>
              <strong>Profissão:</strong> {memoria.profissao}
            </p>
          )}
          {memoria.tipo === "LUGAR" && memoria.localizacao && (
            <p>
              <strong>Localização:</strong> {memoria.localizacao}
            </p>
          )}
          {memoria.tipo === "DATA" && memoria.dataRelacionada && (
            <p>
              <strong>Data:</strong>{" "}
              {new Date(memoria.dataRelacionada).toLocaleDateString("pt-BR")}
            </p>
          )}
          {memoria.tipo === "EVENTO" && memoria.dataInicio && (
            <p>
              <strong>Data de início:</strong>{" "}
              {new Date(memoria.dataInicio).toLocaleDateString("pt-BR")}
            </p>
          )}
          {memoria.tipo === "EVENTO" && memoria.dataFim && (
            <p>
              <strong>Data de fim:</strong>{" "}
              {new Date(memoria.dataFim).toLocaleDateString("pt-BR")}
            </p>
          )}
          {memoria.tipo === "OBRA_ARTE" && memoria.artista && (
            <p>
              <strong>Artista:</strong> {memoria.artista}
            </p>
          )}
          {memoria.tipo === "OBRA_ARTE" && memoria.anoCriacao && (
            <p>
              <strong>Ano de criação:</strong> {memoria.anoCriacao}
            </p>
          )}
          {memoria.tipo === "OBRA_ARTE" && memoria.tecnica && (
            <p>
              <strong>Técnica:</strong> {memoria.tecnica}
            </p>
          )}
          {memoria.tipo === "COLETIVO_ORGANIZADO" &&
            memoria.membrosPrincipais && (
              <p>
                <strong>Membros principais:</strong>{" "}
                {JSON.parse(memoria.membrosPrincipais).join(", ")}
              </p>
            )}
          {memoria.tipo === "COLETIVO_ORGANIZADO" && memoria.dataFormacao && (
            <p>
              <strong>Data de formação:</strong>{" "}
              {new Date(memoria.dataFormacao).toLocaleDateString("pt-BR")}
            </p>
          )}
          {memoria.tipo === "COLETIVO_ORGANIZADO" && memoria.tipoColetivo && (
            <p>
              <strong>Tipo de coletivo:</strong> {memoria.tipoColetivo}
            </p>
          )}
          {memoria.categoria && (
            <p>
              <strong>Categoria:</strong> {memoria.categoria}
            </p>
          )}
        </div>

        {memoria.descricao && (
          <div style={{ marginBottom: "16px" }}>
            <h3>História</h3>
            <p style={{ lineHeight: 1.6 }}>{memoria.descricao}</p>
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
              ❤️ {memoria._count.curtidas}
            </span>
            <span style={{ marginRight: "20px" }}>
              💬 {memoria._count.comentarios}
            </span>
            <span>📎 {memoria._count.medias}</span>
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
      {memoria.tipo === "OBRA_ARTE" && memoria.arquivoUrl && (
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
            {memoria.tipoArquivo === "imagem" && (
              <div>
                <img
                  src={memoria.arquivoUrl}
                  alt={memoria.nome}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "400px",
                    borderRadius: "8px",
                  }}
                />
              </div>
            )}
            {memoria.tipoArquivo === "audio" && (
              <div>
                <audio
                  src={memoria.arquivoUrl}
                  controls
                  style={{ width: "100%" }}
                />
              </div>
            )}
            {memoria.tipoArquivo === "video" && (
              <div>
                <video
                  src={memoria.arquivoUrl}
                  controls
                  style={{ maxWidth: "100%", maxHeight: "400px" }}
                />
              </div>
            )}
            {(memoria.tipoArquivo === "documento" ||
              !["imagem", "audio", "video"].includes(memoria.tipoArquivo)) && (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <p style={{ marginBottom: "16px" }}>
                  📄 {memoria.nomeArquivo || "Documento"}
                  {memoria.tamanhoArquivo && (
                    <span style={{ color: "#666", fontSize: "14px" }}>
                      {" "}
                      ({(memoria.tamanhoArquivo / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  )}
                </p>
                <a
                  href={memoria.arquivoUrl}
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

      {/* Comentários */}
      <div>
        <h2>Comentários</h2>

        {/* Formulário de comentário moderno */}
        <div style={{ marginBottom: "24px" }}>
          <div
            style={{
              backgroundColor: "white",
              border: "1px solid #ddd",
              borderRadius: "20px",
              padding: "16px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            {/* Prévia da mídia selecionada */}
            {comentarioFile && (
              <div
                style={{
                  marginBottom: "12px",
                  padding: "8px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  {comentarioMediaType === "foto" && <span>📷</span>}
                  {comentarioMediaType === "video" && <span>🎥</span>}
                  {comentarioMediaType === "audio" && <span>🎵</span>}
                  {comentarioMediaType === "documento" && <span>📄</span>}
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: "500" }}>
                      {comentarioFile.name}
                    </div>
                    <div style={{ fontSize: "12px", color: "#666" }}>
                      {(comentarioFile.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                </div>
                <button
                  onClick={removeComentarioMedia}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#666",
                    cursor: "pointer",
                    fontSize: "18px",
                  }}
                >
                  ×
                </button>
              </div>
            )}

            {/* Indicador de gravação */}
            {isRecording && (
              <div
                style={{
                  marginBottom: "12px",
                  padding: "8px",
                  backgroundColor: "#f8d7da",
                  border: "1px solid #f5c6cb",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "#721c24",
                }}
              >
                <span
                  style={{ fontSize: "16px", animation: "pulse 1s infinite" }}
                >
                  🔴
                </span>
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  Gravando áudio... Clique em ⏹️ para parar
                </span>
              </div>
            )}

            {/* Barra de entrada */}
            <form
              onSubmit={handleComentario}
              style={{ display: "flex", alignItems: "flex-end", gap: "8px" }}
            >
              <div style={{ flex: 1, position: "relative" }}>
                <textarea
                  value={novoComentario}
                  onChange={(e) => setNovoComentario(e.target.value)}
                  placeholder="Escreva um comentário..."
                  rows={1}
                  style={{
                    width: "100%",
                    minHeight: "40px",
                    maxHeight: "120px",
                    padding: "12px 16px",
                    border: "1px solid #ddd",
                    borderRadius: "20px",
                    resize: "none",
                    outline: "none",
                    fontFamily: "inherit",
                    fontSize: "14px",
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      const fakeEvent = { preventDefault: () => {} };
                      handleComentario(fakeEvent);
                    }
                  }}
                />
              </div>

              {/* Botões de mídia */}
              <div style={{ display: "flex", gap: "4px", marginRight: "8px" }}>
                <button
                  type="button"
                  onClick={() => handleMediaSelect("foto")}
                  style={{
                    width: "32px",
                    height: "32px",
                    border: "none",
                    borderRadius: "50%",
                    backgroundColor: "#f8f9fa",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "16px",
                  }}
                  title="Adicionar foto"
                >
                  📷
                </button>
                <button
                  type="button"
                  onClick={() => handleMediaSelect("video")}
                  style={{
                    width: "32px",
                    height: "32px",
                    border: "none",
                    borderRadius: "50%",
                    backgroundColor: "#f8f9fa",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "16px",
                  }}
                  title="Adicionar vídeo"
                >
                  🎥
                </button>
                <button
                  type="button"
                  onClick={() => handleMediaSelect("audio")}
                  style={{
                    width: "32px",
                    height: "32px",
                    border: "none",
                    borderRadius: "50%",
                    backgroundColor: "#f8f9fa",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "16px",
                  }}
                  title="Selecionar arquivo de áudio"
                >
                  🎵
                </button>
                <button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  style={{
                    width: "32px",
                    height: "32px",
                    border: "none",
                    borderRadius: "50%",
                    backgroundColor: isRecording ? "#dc3545" : "#f8f9fa",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "16px",
                    color: isRecording ? "white" : "inherit",
                  }}
                  title={isRecording ? "Parar gravação" : "Gravar áudio"}
                >
                  {isRecording ? "⏹️" : "�"}
                </button>
                <button
                  type="button"
                  onClick={() => handleMediaSelect("documento")}
                  style={{
                    width: "32px",
                    height: "32px",
                    border: "none",
                    borderRadius: "50%",
                    backgroundColor: "#f8f9fa",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "16px",
                  }}
                  title="Adicionar documento"
                >
                  📄
                </button>
              </div>

              {/* Botão enviar */}
              <button
                type="submit"
                disabled={
                  (!(novoComentario.trim().length > 0) && !comentarioFile) ||
                  enviandoComentario
                }
                style={{
                  padding: "8px 16px",
                  backgroundColor:
                    (!(novoComentario.trim().length > 0) && !comentarioFile) ||
                    enviandoComentario
                      ? "#ccc"
                      : "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "20px",
                  cursor:
                    (!(novoComentario.trim().length > 0) && !comentarioFile) ||
                    enviandoComentario
                      ? "not-allowed"
                      : "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                  minWidth: "60px",
                }}
              >
                {enviandoComentario ? "..." : "Enviar"}
              </button>
            </form>
          </div>
        </div>

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
              {comentario.texto && (
                <p style={{ margin: "0 0 12px 0" }}>{comentario.texto}</p>
              )}

              {/* Mídia do comentário */}
              {comentario.mediaUrl && (
                <div style={{ marginTop: "8px" }}>
                  {comentario.mediaTipo === "foto" && (
                    <img
                      src={comentario.mediaUrl}
                      alt="Foto do comentário"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "300px",
                        borderRadius: "8px",
                        objectFit: "cover",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        setModalImage(comentario.mediaUrl);
                        setShowModal(true);
                      }}
                    />
                  )}
                  {comentario.mediaTipo === "video" && (
                    <video
                      src={comentario.mediaUrl}
                      controls
                      style={{
                        maxWidth: "100%",
                        maxHeight: "300px",
                        borderRadius: "8px",
                      }}
                    />
                  )}
                  {comentario.mediaTipo === "audio" && (
                    <audio
                      src={comentario.mediaUrl}
                      controls
                      style={{ width: "100%" }}
                    />
                  )}
                  {comentario.mediaTipo === "documento" && (
                    <div
                      style={{
                        padding: "12px",
                        backgroundColor: "#f8f9fa",
                        borderRadius: "8px",
                        border: "1px solid #dee2e6",
                      }}
                    >
                      <a
                        href={comentario.mediaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          textDecoration: "none",
                          color: "#007bff",
                        }}
                      >
                        <span style={{ fontSize: "20px" }}>📄</span>
                        <span>Documento anexado - Clique para baixar</span>
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {comentarios.length === 0 && (
          <p style={{ color: "#666", fontStyle: "italic" }}>
            Nenhum comentário ainda. Seja o primeiro!
          </p>
        )}
      </div>

      {/* Modal para imagem ampliada */}
      {showModal && modalImage && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              position: "relative",
              maxWidth: "90vw",
              maxHeight: "90vh",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={modalImage}
              alt="Imagem ampliada"
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
              }}
            />
            <button
              onClick={() => setShowModal(false)}
              style={{
                position: "absolute",
                top: "-40px",
                right: "0",
                background: "none",
                border: "none",
                color: "white",
                fontSize: "24px",
                cursor: "pointer",
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
