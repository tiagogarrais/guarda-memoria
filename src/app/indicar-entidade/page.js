"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export const dynamic = "force-dynamic";

function IndicarEntidadeContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const cidadeId = searchParams.get("cidadeId");

  const [form, setForm] = useState({
    tipo: "PESSOA",
    nome: "",
    descricao: "",
    fotoUrl: "",
    categoria: "",
    tags: "",
    // Campos específicos por tipo
    dataNascimento: "",
    profissao: "",
    localizacao: "",
    dataRelacionada: "",
    dataInicio: "",
    dataFim: "",
    artista: "",
    anoCriacao: "",
    tecnica: "",
    arquivoUrl: "",
    tipoArquivo: "",
    tamanhoArquivo: "",
    nomeArquivo: "",
    membrosPrincipais: "",
    dataFormacao: "",
    tipoColetivo: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!session) {
      router.push("/");
    }
    if (!cidadeId) {
      router.push("/selecionar-localizacao");
    }
  }, [session, cidadeId, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleTipoChange = (tipo) => {
    setForm({ ...form, tipo });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cidadeId) {
      setError("Cidade não selecionada. Volte e selecione uma cidade.");
      return;
    }
    if (!form.nome || !form.tipo) {
      setError("Nome e tipo são obrigatórios.");
      return;
    }

    // Para obras de arte, arquivo é obrigatório
    if (form.tipo === "OBRA_ARTE" && !selectedFile) {
      setError("Para obras de arte, é obrigatório anexar um arquivo.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Primeiro, criar a entidade sem o arquivo
      const entidadeData = {
        ...form,
        cidadeId,
        dataNascimento: form.dataNascimento || null,
        dataRelacionada: form.dataRelacionada || null,
        dataInicio: form.dataInicio || null,
        dataFim: form.dataFim || null,
        artista: form.artista || null,
        anoCriacao: form.anoCriacao ? parseInt(form.anoCriacao) : null,
        tecnica: form.tecnica || null,
        arquivoUrl: null, // Será preenchido após upload
        tipoArquivo: null, // Será preenchido após upload
        tamanhoArquivo: null, // Será preenchido após upload
        nomeArquivo: null, // Será preenchido após upload
        membrosPrincipais: form.membrosPrincipais
          ? JSON.stringify(
              form.membrosPrincipais.split(",").map((m) => m.trim())
            )
          : null,
        dataFormacao: form.dataFormacao || null,
        tipoColetivo: form.tipoColetivo || null,
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()) : null,
      };

      const response = await fetch("/api/entidades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entidadeData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao registrar entidade");
      }

      const entidade = await response.json();

      // Se for obra de arte e houver arquivo, fazer upload
      if (form.tipo === "OBRA_ARTE" && selectedFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", selectedFile);
        uploadFormData.append("entidadeId", entidade.id);

        const uploadResponse = await fetch("/api/upload-obra-arte", {
          method: "POST",
          body: uploadFormData,
        });

        if (!uploadResponse.ok) {
          const uploadError = await uploadResponse.json();
          // Entidade foi criada, mas upload falhou - informar ao usuário
          alert(
            `Entidade registrada, mas houve erro no upload do arquivo: ${uploadError.error}`
          );
        } else {
          alert("Obra de arte registrada com sucesso!");
        }
      } else {
        alert("Entidade registrada com sucesso!");
      }

      router.push(`/entidades?cidadeId=${cidadeId}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderCamposEspecificos = () => {
    switch (form.tipo) {
      case "PESSOA":
        return (
          <>
            <div>
              <label htmlFor="dataNascimento">Data de nascimento:</label>
              <input
                type="date"
                id="dataNascimento"
                name="dataNascimento"
                value={form.dataNascimento}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ccc",
                  borderRadius: 4,
                }}
              />
            </div>
            <div>
              <label htmlFor="profissao">Profissão:</label>
              <input
                type="text"
                id="profissao"
                name="profissao"
                autoComplete="off"
                value={form.profissao}
                onChange={handleChange}
                placeholder="Ex: professor, médico, artista..."
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ccc",
                  borderRadius: 4,
                }}
              />
            </div>
          </>
        );
      case "LUGAR":
        return (
          <div>
            <label htmlFor="localizacao">Localização/Endereço:</label>
            <input
              type="text"
              id="localizacao"
              name="localizacao"
              value={form.localizacao}
              onChange={handleChange}
              placeholder="Ex: Rua das Flores, 123 - Centro"
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: 4,
              }}
            />
          </div>
        );
      case "DATA":
        return (
          <div>
            <label htmlFor="dataRelacionada">Data:</label>
            <input
              type="date"
              id="dataRelacionada"
              name="dataRelacionada"
              value={form.dataRelacionada}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: 4,
              }}
            />
          </div>
        );
      case "EVENTO":
        return (
          <>
            <div>
              <label htmlFor="dataInicio">Data de início:</label>
              <input
                type="date"
                id="dataInicio"
                name="dataInicio"
                value={form.dataInicio}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ccc",
                  borderRadius: 4,
                }}
              />
            </div>
            <div>
              <label htmlFor="dataFim">Data de fim:</label>
              <input
                type="date"
                id="dataFim"
                name="dataFim"
                value={form.dataFim}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ccc",
                  borderRadius: 4,
                }}
              />
            </div>
          </>
        );
      case "OBRA_ARTE":
        return (
          <>
            <div>
              <label htmlFor="artista">Artista:</label>
              <input
                type="text"
                id="artista"
                name="artista"
                value={form.artista}
                onChange={handleChange}
                placeholder="Nome do artista ou autor da obra"
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ccc",
                  borderRadius: 4,
                }}
              />
            </div>
            <div>
              <label htmlFor="anoCriacao">Ano de criação:</label>
              <input
                type="number"
                id="anoCriacao"
                name="anoCriacao"
                value={form.anoCriacao}
                onChange={handleChange}
                placeholder="Ex: 1985"
                min="1"
                max={new Date().getFullYear()}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ccc",
                  borderRadius: 4,
                }}
              />
            </div>
            <div>
              <label htmlFor="tecnica">Técnica:</label>
              <input
                type="text"
                id="tecnica"
                name="tecnica"
                value={form.tecnica}
                onChange={handleChange}
                placeholder="Ex: óleo sobre tela, escultura, fotografia..."
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ccc",
                  borderRadius: 4,
                }}
              />
            </div>
            <div>
              <label htmlFor="arquivo">Arquivo da obra*:</label>
              <input
                type="file"
                id="arquivo"
                name="arquivo"
                accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.txt,.rtf"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ccc",
                  borderRadius: 4,
                }}
              />
              <small style={{ color: "#666", fontSize: "12px" }}>
                Tipos aceitos: imagens, áudios, vídeos e documentos (PDF, DOC,
                TXT). Máximo 100MB.
              </small>
              {selectedFile && (
                <div
                  style={{
                    marginTop: "8px",
                    padding: "8px",
                    backgroundColor: "#f8f9fa",
                    borderRadius: 4,
                  }}
                >
                  <strong>Arquivo selecionado:</strong> {selectedFile.name} (
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </div>
              )}
            </div>
          </>
        );
      case "COLETIVO_ORGANIZADO":
        return (
          <>
            <div>
              <label htmlFor="membrosPrincipais">Membros principais:</label>
              <textarea
                id="membrosPrincipais"
                name="membrosPrincipais"
                value={form.membrosPrincipais}
                onChange={handleChange}
                placeholder="Liste os membros principais separados por vírgula (ex: João Silva, Maria Santos, Pedro Costa)"
                rows={3}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ccc",
                  borderRadius: 4,
                  resize: "vertical",
                }}
              />
            </div>
            <div>
              <label htmlFor="dataFormacao">Data de formação:</label>
              <input
                type="date"
                id="dataFormacao"
                name="dataFormacao"
                value={form.dataFormacao}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ccc",
                  borderRadius: 4,
                }}
              />
            </div>
            <div>
              <label htmlFor="tipoColetivo">Tipo de coletivo:</label>
              <select
                id="tipoColetivo"
                name="tipoColetivo"
                value={form.tipoColetivo}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ccc",
                  borderRadius: 4,
                }}
              >
                <option value="">Selecione o tipo</option>
                <option value="musical">
                  Musical (banda, orquestra, coral)
                </option>
                <option value="esportivo">Esportivo (time, clube)</option>
                <option value="cultural">
                  Cultural (teatro, dança, artes)
                </option>
                <option value="social">
                  Social (ONG, associação comunitária)
                </option>
                <option value="educacional">
                  Educacional (escola, grupo de estudo)
                </option>
                <option value="profissional">
                  Profissional (sindicato, associação)
                </option>
                <option value="outro">Outro</option>
              </select>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  if (!session) {
    return <div>Carregando...</div>;
  }

  return (
    <div
      style={{
        maxWidth: 600,
        margin: "0 auto",
        padding: "24px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>Registrar Memória</h1>
      <p>Compartilhe memórias que marcaram ou ainda marcam a sua cidade.</p>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "16px" }}
      >
        {/* Seleção de tipo */}
        <div>
          <label>Tipo*:</label>
          <div
            style={{
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
              marginTop: "8px",
            }}
          >
            {[
              {
                value: "PESSOA",
                label: "👤 Pessoa",
                desc: "Pessoa que marcou a cidade",
              },
              {
                value: "LUGAR",
                label: "📍 Lugar",
                desc: "Local histórico ou importante",
              },
              { value: "DATA", label: "📅 Data", desc: "Data significativa" },
              { value: "EVENTO", label: "🎉 Evento", desc: "Evento marcante" },
              {
                value: "OBRA_ARTE",
                label: "🎨 Obra de Arte",
                desc: "Obra artística da cidade",
              },
              {
                value: "COLETIVO_ORGANIZADO",
                label: "👥 Coletivo Organizado",
                desc: "Grupo organizado (banda, associação)",
              },
            ].map((tipo) => (
              <button
                key={tipo.value}
                type="button"
                onClick={() => handleTipoChange(tipo.value)}
                style={{
                  padding: "12px",
                  border:
                    form.tipo === tipo.value
                      ? "2px solid #007bff"
                      : "1px solid #ccc",
                  borderRadius: 8,
                  backgroundColor:
                    form.tipo === tipo.value ? "#e7f3ff" : "white",
                  cursor: "pointer",
                  textAlign: "center",
                  minWidth: "120px",
                }}
              >
                <div style={{ fontSize: "20px" }}>
                  {tipo.label.split(" ")[0]}
                </div>
                <div style={{ fontSize: "14px", fontWeight: "bold" }}>
                  {tipo.label.split(" ")[1]}
                </div>
                <div style={{ fontSize: "12px", color: "#666" }}>
                  {tipo.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="nome">Nome*:</label>
          <input
            type="text"
            id="nome"
            name="nome"
            value={form.nome}
            onChange={handleChange}
            required
            autocomplete="off"
            placeholder={
              form.tipo === "PESSOA"
                ? "Nome completo da pessoa"
                : form.tipo === "LUGAR"
                ? "Nome do lugar"
                : form.tipo === "DATA"
                ? "Nome ou título da data"
                : form.tipo === "EVENTO"
                ? "Nome ou título do evento"
                : form.tipo === "OBRA_ARTE"
                ? "Nome da obra de arte"
                : "Nome do coletivo organizado"
            }
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: 4,
            }}
          />
        </div>

        <div>
          <label htmlFor="descricao">História/Descrição*:</label>
          <textarea
            id="descricao"
            name="descricao"
            value={form.descricao}
            onChange={handleChange}
            required
            rows={4}
            placeholder={
              form.tipo === "PESSOA"
                ? "Conte a história dessa pessoa, suas contribuições, curiosidades..."
                : form.tipo === "LUGAR"
                ? "Descreva a importância histórica ou cultural deste lugar..."
                : form.tipo === "DATA"
                ? "Explique o significado desta data para a cidade..."
                : form.tipo === "EVENTO"
                ? "Descreva o evento e sua importância histórica..."
                : form.tipo === "OBRA_ARTE"
                ? "Descreva a obra de arte, seu contexto histórico e importância..."
                : "Descreva a história e importância deste coletivo organizado..."
            }
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: 4,
              resize: "vertical",
            }}
          />
        </div>

        <div>
          <label htmlFor="fotoUrl">URL da Foto (opcional):</label>
          <input
            type="url"
            id="fotoUrl"
            name="fotoUrl"
            value={form.fotoUrl}
            onChange={handleChange}
            placeholder="https://exemplo.com/foto.jpg"
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: 4,
            }}
          />
        </div>

        <div>
          <label htmlFor="categoria">Categoria:</label>
          <input
            type="text"
            id="categoria"
            name="categoria"
            autocomplete="off"
            value={form.categoria}
            onChange={handleChange}
            placeholder={
              form.tipo === "PESSOA"
                ? "Ex: artista, político, educador..."
                : form.tipo === "LUGAR"
                ? "Ex: praça, monumento, prédio histórico..."
                : form.tipo === "DATA"
                ? "Ex: feriado, aniversário, fundação..."
                : form.tipo === "EVENTO"
                ? "Ex: festival, comemoração, tragédia..."
                : form.tipo === "OBRA_ARTE"
                ? "Ex: pintura, escultura, música, literatura..."
                : "Ex: musical, esportivo, cultural, social..."
            }
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: 4,
            }}
          />
        </div>

        {/* Campos específicos por tipo */}
        {renderCamposEspecificos()}

        <div>
          <label htmlFor="tags">Tags (separadas por vírgula):</label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={form.tags}
            onChange={handleChange}
            placeholder="Ex: história, cultura, memória, importante..."
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: 4,
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "12px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          {loading ? "Registrando..." : "Registrar Memória"}
        </button>
      </form>
    </div>
  );
}

export default function IndicarEntidadePage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <IndicarEntidadeContent />
    </Suspense>
  );
}
