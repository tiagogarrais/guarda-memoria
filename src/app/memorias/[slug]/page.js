"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import NavigationBar from "@/components/NavigationBar";

export const dynamic = "force-dynamic";

function MemoriasContent({ params }) {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = params.slug;

  const [memorias, setMemorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cidadeNome, setCidadeNome] = useState("");
  const [cidadeId, setCidadeId] = useState("");

  const [filtros, setFiltros] = useState({
    search: "",
    tipo: "", // PESSOA, LUGAR, DATA, EVENTO, OBRA_ARTE, COLETIVO_ORGANIZADO
    categoria: "",
    profissao: "",
    dataInicio: "",
    dataFim: "",
  });
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  useEffect(() => {
    if (!session) {
      router.push("/");
      return;
    }
    fetchCidade();
  }, [session, slug, router]);

  const fetchCidade = async () => {
    try {
      const response = await fetch(`/api/countries/slug/${slug}`);
      if (!response.ok) throw new Error("Cidade não encontrada");
      const data = await response.json();
      if (data.success) {
        setCidadeNome(data.cidade.nome);
        setCidadeId(data.cidade.id);
      } else {
        throw new Error(data.error || "Cidade não encontrada");
      }
    } catch (err) {
      // Cidade não encontrada - redirecionar para seleção de localização
      router.push("/selecionar-localizacao");
    }
  };

  const fetchMemorias = useCallback(async () => {
    try {
      const params = new URLSearchParams({ slug });
      if (filtros.search) params.append("search", filtros.search);
      if (filtros.tipo) params.append("tipo", filtros.tipo);
      if (filtros.categoria) params.append("categoria", filtros.categoria);
      if (filtros.profissao) params.append("profissao", filtros.profissao);
      if (filtros.dataInicio) params.append("dataInicio", filtros.dataInicio);
      if (filtros.dataFim) params.append("dataFim", filtros.dataFim);

      const response = await fetch(`/api/memorias?${params}`);
      if (!response.ok) throw new Error("Erro ao buscar memorias");
      const data = await response.json();

      // Filtrar memorias com IDs válidos
      const memoriasValidas = data.filter(
        (memoria) =>
          memoria.id &&
          typeof memoria.id === "string" &&
          memoria.id.length > 0 &&
          !memoria.id.includes("<") &&
          !memoria.id.includes(">")
      );

      setMemorias(memoriasValidas);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [slug, filtros]);

  useEffect(() => {
    if (slug) {
      fetchMemorias();
    }
  }, [slug, fetchMemorias]);

  const handleFiltroChange = (campo, valor) => {
    setFiltros((prev) => ({ ...prev, [campo]: valor }));
  };

  const limparFiltros = () => {
    setFiltros({
      search: "",
      tipo: "",
      categoria: "",
      profissao: "",
      dataInicio: "",
      dataFim: "",
    });
  };

  if (!session) {
    return <div>Carregando...</div>;
  }

  if (loading) {
    return (
      <div>
        <SiteHeader />
        <div style={{ textAlign: "center", padding: "50px" }}>
          <p>Carregando memórias...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <SiteHeader />
        <div style={{ textAlign: "center", padding: "50px" }}>
          <p>Erro: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SiteHeader />
      <NavigationBar />
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px" }}>
        <div style={{ marginBottom: "24px" }}>
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: "bold",
              marginBottom: "8px",
            }}
          >
            Memórias de {cidadeNome}
          </h1>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <Link
              href="/selecionar-localizacao"
              style={{
                color: "#3b82f6",
                textDecoration: "none",
                fontSize: "0.875rem",
              }}
            >
              Alterar localização
            </Link>
            <Link
              href="/indicar-memoria"
              style={{
                backgroundColor: "#3b82f6",
                color: "white",
                padding: "8px 16px",
                borderRadius: "6px",
                textDecoration: "none",
                fontSize: "0.875rem",
              }}
            >
              Indicar memória
            </Link>
          </div>
        </div>

        {/* Filtros */}
        <div style={{ marginBottom: "24px" }}>
          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            style={{
              backgroundColor: "#f3f4f6",
              border: "1px solid #d1d5db",
              padding: "8px 16px",
              borderRadius: "6px",
              cursor: "pointer",
              marginBottom: "12px",
            }}
          >
            {mostrarFiltros ? "Ocultar filtros" : "Mostrar filtros"}
          </button>

          {mostrarFiltros && (
            <div
              style={{
                backgroundColor: "#f9fafb",
                padding: "16px",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "16px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "0.875rem",
                    }}
                  >
                    Buscar
                  </label>
                  <input
                    type="text"
                    value={filtros.search}
                    onChange={(e) =>
                      handleFiltroChange("search", e.target.value)
                    }
                    placeholder="Nome, descrição, categoria..."
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: "1px solid #d1d5db",
                      borderRadius: "4px",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "0.875rem",
                    }}
                  >
                    Tipo
                  </label>
                  <select
                    value={filtros.tipo}
                    onChange={(e) => handleFiltroChange("tipo", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: "1px solid #d1d5db",
                      borderRadius: "4px",
                    }}
                  >
                    <option value="">Todos</option>
                    <option value="PESSOA">Pessoa</option>
                    <option value="LUGAR">Lugar</option>
                    <option value="DATA">Data</option>
                    <option value="EVENTO">Evento</option>
                    <option value="OBRA_ARTE">Obra de Arte</option>
                    <option value="COLETIVO_ORGANIZADO">
                      Coletivo Organizado
                    </option>
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "0.875rem",
                    }}
                  >
                    Categoria
                  </label>
                  <input
                    type="text"
                    value={filtros.categoria}
                    onChange={(e) =>
                      handleFiltroChange("categoria", e.target.value)
                    }
                    placeholder="Categoria da memória"
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: "1px solid #d1d5db",
                      borderRadius: "4px",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "0.875rem",
                    }}
                  >
                    Profissão
                  </label>
                  <input
                    type="text"
                    value={filtros.profissao}
                    onChange={(e) =>
                      handleFiltroChange("profissao", e.target.value)
                    }
                    placeholder="Profissão relacionada"
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: "1px solid #d1d5db",
                      borderRadius: "4px",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "0.875rem",
                    }}
                  >
                    Data início
                  </label>
                  <input
                    type="date"
                    value={filtros.dataInicio}
                    onChange={(e) =>
                      handleFiltroChange("dataInicio", e.target.value)
                    }
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: "1px solid #d1d5db",
                      borderRadius: "4px",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "0.875rem",
                    }}
                  >
                    Data fim
                  </label>
                  <input
                    type="date"
                    value={filtros.dataFim}
                    onChange={(e) =>
                      handleFiltroChange("dataFim", e.target.value)
                    }
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: "1px solid #d1d5db",
                      borderRadius: "4px",
                    }}
                  />
                </div>
              </div>

              <div style={{ marginTop: "16px" }}>
                <button
                  onClick={limparFiltros}
                  style={{
                    backgroundColor: "#dc2626",
                    color: "white",
                    padding: "8px 16px",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Limpar filtros
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Lista de memórias */}
        <div>
          {memorias.length === 0 ? (
            <div style={{ textAlign: "center", padding: "50px" }}>
              <p
                style={{
                  fontSize: "1.125rem",
                  color: "#6b7280",
                  marginBottom: "16px",
                }}
              >
                Nenhuma memória encontrada para {cidadeNome}.
              </p>
              <Link
                href="/indicar-memoria"
                style={{
                  backgroundColor: "#3b82f6",
                  color: "white",
                  padding: "12px 24px",
                  borderRadius: "6px",
                  textDecoration: "none",
                  fontSize: "1rem",
                }}
              >
                Seja o primeiro a indicar uma memória
              </Link>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "24px",
              }}
            >
              {memorias.map((memoria) => (
                <div
                  key={memoria.id}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    overflow: "hidden",
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  {memoria.fotoUrl && (
                    <img
                      src={memoria.fotoUrl}
                      alt={memoria.nome}
                      style={{
                        width: "100%",
                        height: "200px",
                        objectFit: "cover",
                      }}
                    />
                  )}
                  <div style={{ padding: "16px" }}>
                    <h3
                      style={{
                        fontSize: "1.125rem",
                        fontWeight: "600",
                        marginBottom: "8px",
                      }}
                    >
                      <Link
                        href={`/memoria/${memoria.id}`}
                        style={{ color: "#1f2937", textDecoration: "none" }}
                      >
                        {memoria.nome}
                      </Link>
                    </h3>
                    <p
                      style={{
                        color: "#6b7280",
                        fontSize: "0.875rem",
                        marginBottom: "8px",
                      }}
                    >
                      {memoria.tipo === "PESSOA" && "Pessoa"}
                      {memoria.tipo === "LUGAR" && "Lugar"}
                      {memoria.tipo === "DATA" && "Data"}
                      {memoria.tipo === "EVENTO" && "Evento"}
                      {memoria.tipo === "OBRA_ARTE" && "Obra de Arte"}
                      {memoria.tipo === "COLETIVO_ORGANIZADO" &&
                        "Coletivo Organizado"}
                    </p>
                    {memoria.descricao && (
                      <p
                        style={{
                          color: "#4b5563",
                          fontSize: "0.875rem",
                          marginBottom: "12px",
                        }}
                      >
                        {memoria.descricao.length > 150
                          ? `${memoria.descricao.substring(0, 150)}...`
                          : memoria.descricao}
                      </p>
                    )}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
                        Por {memoria.usuario.fullName}
                      </span>
                      <div
                        style={{
                          display: "flex",
                          gap: "12px",
                          fontSize: "0.75rem",
                          color: "#9ca3af",
                        }}
                      >
                        <span>❤️ {memoria._count.curtidas}</span>
                        <span>💬 {memoria._count.comentarios}</span>
                        <span>📎 {memoria._count.medias}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MemoriasPage({ params }) {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <MemoriasContent params={params} />
    </Suspense>
  );
}
