"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export const dynamic = "force-dynamic";

function IndicarPessoaContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const cidadeId = searchParams.get("cidadeId");

  const [form, setForm] = useState({
    nome: "",
    historia: "",
    fotoUrl: "",
    dataNascimento: "",
    profissao: "",
    categoria: "",
    tags: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!session) {
      router.push("/");
    }
  }, [session, router]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cidadeId) {
      setError("Cidade não selecionada. Volte e selecione uma cidade.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/pessoas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          cidadeId,
          dataNascimento: form.dataNascimento || null,
          tags: form.tags ? form.tags.split(",").map((t) => t.trim()) : null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao indicar pessoa");
      }

      alert("Pessoa indicada com sucesso!");
      router.push(`/pessoas?cidadeId=${cidadeId}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
      <h1>Indicar Pessoa</h1>
      <p>Compartilhe a história de alguém que marcou sua cidade.</p>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "16px" }}
      >
        <div>
          <label htmlFor="nome">Nome*:</label>
          <input
            type="text"
            id="nome"
            name="nome"
            value={form.nome}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: 4,
            }}
          />
        </div>

        <div>
          <label htmlFor="historia">História:</label>
          <textarea
            id="historia"
            name="historia"
            value={form.historia}
            onChange={handleChange}
            rows={4}
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: 4,
            }}
          />
        </div>

        <div>
          <label htmlFor="fotoUrl">URL da Foto:</label>
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
          <label htmlFor="dataNascimento">Data de Nascimento:</label>
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
            value={form.profissao}
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
          <label htmlFor="categoria">Categoria:</label>
          <select
            id="categoria"
            name="categoria"
            value={form.categoria}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: 4,
            }}
          >
            <option value="">Selecione uma categoria</option>
            <option value="artista">Artista</option>
            <option value="líder comunitário">Líder Comunitário</option>
            <option value="educador">Educador</option>
            <option value="atleta">Atleta</option>
            <option value="empresário">Empresário</option>
            <option value="outro">Outro</option>
          </select>
        </div>

        <div>
          <label htmlFor="tags">Tags (separadas por vírgula):</label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={form.tags}
            onChange={handleChange}
            placeholder="ex.: memória, história, cultura"
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
            backgroundColor: loading ? "#ccc" : "#28a745",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "16px",
          }}
        >
          {loading ? "Indicando..." : "Indicar Pessoa"}
        </button>
      </form>
    </div>
  );
}

export default function IndicarPessoa() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <IndicarPessoaContent />
    </Suspense>
  );
}
