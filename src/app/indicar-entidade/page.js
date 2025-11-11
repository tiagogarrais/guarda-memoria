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
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!session) {
      router.push("/");
    }
  }, [session, router]);

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
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/entidades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          cidadeId,
          dataNascimento: form.dataNascimento || null,
          dataRelacionada: form.dataRelacionada || null,
          dataInicio: form.dataInicio || null,
          dataFim: form.dataFim || null,
          tags: form.tags ? form.tags.split(",").map((t) => t.trim()) : null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao registrar entidade");
      }

      alert("Entidade registrada com sucesso!");
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
                style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: 4 }}
              />
            </div>
            <div>
              <label htmlFor="profissao">Profissão:</label>
              <input
                type="text"
                id="profissao"
                name="profissao"
                value={form.profissao}
                onChange={handleChange}
                placeholder="Ex: professor, médico, artista..."
                style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: 4 }}
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
              style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: 4 }}
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
              style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: 4 }}
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
                style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: 4 }}
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
                style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: 4 }}
              />
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
      <p>Compartilhe a história de algo ou alguém que marcou sua cidade.</p>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "16px" }}
      >
        {/* Seleção de tipo */}
        <div>
          <label>Tipo*:</label>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "8px" }}>
            {[
              { value: "PESSOA", label: "👤 Pessoa", desc: "Pessoa que marcou a cidade" },
              { value: "LUGAR", label: "📍 Lugar", desc: "Local histórico ou importante" },
              { value: "DATA", label: "📅 Data", desc: "Data significativa" },
              { value: "EVENTO", label: "🎉 Evento", desc: "Evento marcante" },
            ].map((tipo) => (
              <button
                key={tipo.value}
                type="button"
                onClick={() => handleTipoChange(tipo.value)}
                style={{
                  padding: "12px",
                  border: form.tipo === tipo.value ? "2px solid #007bff" : "1px solid #ccc",
                  borderRadius: 8,
                  backgroundColor: form.tipo === tipo.value ? "#e7f3ff" : "white",
                  cursor: "pointer",
                  textAlign: "center",
                  minWidth: "120px",
                }}
              >
                <div style={{ fontSize: "20px" }}>{tipo.label.split(' ')[0]}</div>
                <div style={{ fontSize: "14px", fontWeight: "bold" }}>{tipo.label.split(' ')[1]}</div>
                <div style={{ fontSize: "12px", color: "#666" }}>{tipo.desc}</div>
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
            placeholder={
              form.tipo === "PESSOA" ? "Nome completo da pessoa" :
              form.tipo === "LUGAR" ? "Nome do lugar" :
              form.tipo === "DATA" ? "Nome ou título da data" :
              "Nome ou título do evento"
            }
            style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: 4 }}
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
              form.tipo === "PESSOA" ? "Conte a história dessa pessoa, suas contribuições, curiosidades..." :
              form.tipo === "LUGAR" ? "Descreva a importância histórica ou cultural deste lugar..." :
              form.tipo === "DATA" ? "Explique o significado desta data para a cidade..." :
              "Descreva o evento e sua importância histórica..."
            }
            style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: 4, resize: "vertical" }}
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
            style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: 4 }}
          />
        </div>

        <div>
          <label htmlFor="categoria">Categoria:</label>
          <input
            type="text"
            id="categoria"
            name="categoria"
            value={form.categoria}
            onChange={handleChange}
            placeholder={
              form.tipo === "PESSOA" ? "Ex: artista, político, educador..." :
              form.tipo === "LUGAR" ? "Ex: praça, monumento, prédio histórico..." :
              form.tipo === "DATA" ? "Ex: feriado, aniversário, fundação..." :
              "Ex: festival, comemoração, tragédia..."
            }
            style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: 4 }}
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
            style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: 4 }}
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