"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

export const dynamic = "force-dynamic";

function EntidadesContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const cidadeId = searchParams.get("cidadeId");

  const [entidades, setEntidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cidadeNome, setCidadeNome] = useState("");

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
    if (!cidadeId) {
      router.push("/selecionar-localizacao");
      return;
    }
    fetchCidade();
    fetchEntidades();
  }, [session, cidadeId, router, filtros]);

  const fetchCidade = async () => {
    try {
      const response = await fetch(`/api/cidades/${cidadeId}`);
      if (!response.ok) throw new Error("Cidade não encontrada");
      const data = await response.json();
      setCidadeNome(data.nome);
    } catch (err) {
      setError("Cidade não encontrada");
    }
  };

  const fetchEntidades = async () => {
    try {
      const params = new URLSearchParams({ cidadeId });
      if (filtros.search) params.append("search", filtros.search);
      if (filtros.tipo) params.append("tipo", filtros.tipo);
      if (filtros.categoria) params.append("categoria", filtros.categoria);
      if (filtros.profissao) params.append("profissao", filtros.profissao);
      if (filtros.dataInicio) params.append("dataInicio", filtros.dataInicio);
      if (filtros.dataFim) params.append("dataFim", filtros.dataFim);

      const response = await fetch(`/api/entidades?${params}`);
      if (!response.ok) throw new Error("Erro ao buscar entidades");
      const data = await response.json();

      // Filtrar entidades com IDs válidos
      const entidadesValidas = data.filter(
        (entidade) =>
          entidade.id &&
          typeof entidade.id === "string" &&
          entidade.id.length > 0 &&
          !entidade.id.includes("<") &&
          !entidade.id.includes(">")
      );

      setEntidades(entidadesValidas);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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

  if (!session || !cidadeId) {
    return <div>Carregando...</div>;
  }

  if (loading) return <div>Carregando entidades...</div>;
  if (error) return <div>Erro: {error}</div>;

  const top3 = entidades.slice(0, 3);
  const resto = entidades.slice(3);

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "24px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1 style={{ margin: 0, color: "#333" }}>Memórias de {cidadeNome}</h1>
          <p style={{ margin: "4px 0 0 0", color: "#666" }}>
            {entidades.length} entidade{entidades.length !== 1 ? "s" : ""}{" "}
            registrada{entidades.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href={`/indicar-entidade?cidadeId=${cidadeId}`}>
          <button
            style={{
              padding: "12px 24px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            + Registrar Memória
          </button>
        </Link>
      </div>

      {/* Filtros */}
      <div style={{ marginBottom: "24px" }}>
        <button
          onClick={() => setMostrarFiltros(!mostrarFiltros)}
          style={{
            padding: "8px 16px",
            backgroundColor: "#f8f9fa",
            border: "1px solid #dee2e6",
            borderRadius: 4,
            cursor: "pointer",
            marginBottom: mostrarFiltros ? "16px" : 0,
          }}
        >
          {mostrarFiltros ? "Ocultar Filtros" : "Mostrar Filtros"}
        </button>

        {mostrarFiltros && (
          <div
            style={{
              backgroundColor: "#f8f9fa",
              padding: "16px",
              borderRadius: 8,
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "16px",
                marginBottom: "16px",
              }}
            >
              <div>
                <label style={{ display: "block", marginBottom: "4px" }}>
                  Buscar:
                </label>
                <input
                  type="text"
                  value={filtros.search}
                  onChange={(e) => handleFiltroChange("search", e.target.value)}
                  placeholder="Nome ou descrição..."
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ccc",
                    borderRadius: 4,
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "4px" }}>
                  Tipo:
                </label>
                <select
                  value={filtros.tipo}
                  onChange={(e) => handleFiltroChange("tipo", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ccc",
                    borderRadius: 4,
                  }}
                >
                  <option value="">Todos os tipos</option>
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
                <label style={{ display: "block", marginBottom: "4px" }}>
                  Categoria:
                </label>
                <input
                  type="text"
                  value={filtros.categoria}
                  onChange={(e) =>
                    handleFiltroChange("categoria", e.target.value)
                  }
                  placeholder="Ex: artista, político..."
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ccc",
                    borderRadius: 4,
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "4px" }}>
                  Profissão:
                </label>
                <input
                  type="text"
                  value={filtros.profissao}
                  onChange={(e) =>
                    handleFiltroChange("profissao", e.target.value)
                  }
                  placeholder="Ex: professor, médico..."
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ccc",
                    borderRadius: 4,
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "4px" }}>
                  Data início:
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
                    border: "1px solid #ccc",
                    borderRadius: 4,
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "4px" }}>
                  Data fim:
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
                    border: "1px solid #ccc",
                    borderRadius: 4,
                  }}
                />
              </div>
            </div>

            <button
              onClick={limparFiltros}
              style={{
                padding: "8px 16px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
              }}
            >
              Limpar Filtros
            </button>
          </div>
        )}
      </div>

      {/* Pódio (Top 3) */}
      {top3.length > 0 && (
        <div style={{ marginBottom: "40px" }}>
          <h2 style={{ textAlign: "center", marginBottom: "24px" }}>
            🏆 Destaques de {cidadeNome}
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "24px",
              maxWidth: 900,
              margin: "0 auto",
            }}
          >
            {top3.map((entidade, index) => (
              <div
                key={entidade.id}
                style={{
                  backgroundColor: "white",
                  border: "2px solid #ddd",
                  borderRadius: "12px",
                  padding: "20px",
                  textAlign: "center",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "-10px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    backgroundColor:
                      index === 0
                        ? "#ffd700"
                        : index === 1
                        ? "#c0c0c0"
                        : "#cd7f32",
                    color: "white",
                    borderRadius: "50%",
                    width: "30px",
                    height: "30px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                  }}
                >
                  {index + 1}
                </div>

                {entidade.fotoUrl && (
                  <img
                    src={entidade.fotoUrl}
                    alt={entidade.nome}
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      margin: "0 auto 12px",
                      display: "block",
                    }}
                  />
                )}

                <h3 style={{ margin: "8px 0", fontSize: "18px" }}>
                  <span style={{ marginRight: "8px" }}>
                    {getTipoIcon(entidade.tipo)}
                  </span>
                  {entidade.nome}
                </h3>

                <p style={{ color: "#666", fontSize: "14px", margin: "4px 0" }}>
                  {getTipoLabel(entidade.tipo)}
                </p>

                {entidade.descricao && (
                  <p
                    style={{
                      color: "#666",
                      fontSize: "14px",
                      margin: "8px 0",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {entidade.descricao}
                  </p>
                )}

                <div
                  style={{ marginTop: "12px", fontSize: "14px", color: "#666" }}
                >
                  <span style={{ marginRight: "16px" }}>
                    ❤️ {entidade._count.curtidas}
                  </span>
                  <span style={{ marginRight: "16px" }}>
                    💬 {entidade._count.comentarios}
                  </span>
                  <span>📎 {entidade._count.medias}</span>
                </div>

                <Link href={`/entidade/${entidade.id}`}>
                  <button
                    style={{
                      marginTop: "12px",
                      padding: "8px 16px",
                      backgroundColor: "#007bff",
                      color: "white",
                      border: "none",
                      borderRadius: 4,
                      cursor: "pointer",
                      fontSize: "14px",
                    }}
                  >
                    Ver Detalhes
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista do Resto */}
      {resto.length > 0 && (
        <div>
          <h2 style={{ marginBottom: "24px" }}>Todas as Memórias</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "20px",
            }}
          >
            {resto.map((entidade) => (
              <div
                key={entidade.id}
                style={{
                  backgroundColor: "white",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  padding: "16px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "8px",
                  }}
                >
                  {entidade.fotoUrl && (
                    <img
                      src={entidade.fotoUrl}
                      alt={entidade.nome}
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        marginRight: "12px",
                      }}
                    />
                  )}
                  <div>
                    <h3 style={{ margin: 0, fontSize: "16px" }}>
                      <span style={{ marginRight: "8px" }}>
                        {getTipoIcon(entidade.tipo)}
                      </span>
                      {entidade.nome}
                    </h3>
                    <p
                      style={{
                        margin: "2px 0",
                        color: "#666",
                        fontSize: "14px",
                      }}
                    >
                      {getTipoLabel(entidade.tipo)}
                    </p>
                  </div>
                </div>

                {entidade.descricao && (
                  <p
                    style={{
                      color: "#666",
                      fontSize: "14px",
                      margin: "8px 0",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {entidade.descricao}
                  </p>
                )}

                <div
                  style={{ marginTop: "12px", fontSize: "14px", color: "#666" }}
                >
                  <span style={{ marginRight: "16px" }}>
                    ❤️ {entidade._count.curtidas}
                  </span>
                  <span style={{ marginRight: "16px" }}>
                    💬 {entidade._count.comentarios}
                  </span>
                  <span>📎 {entidade._count.medias}</span>
                </div>

                <Link href={`/entidade/${entidade.id}`}>
                  <button
                    style={{
                      marginTop: "12px",
                      width: "100%",
                      padding: "8px",
                      backgroundColor: "#007bff",
                      color: "white",
                      border: "none",
                      borderRadius: 4,
                      cursor: "pointer",
                      fontSize: "14px",
                    }}
                  >
                    Ver Detalhes
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {entidades.length === 0 && !loading && (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <p style={{ fontSize: "18px", color: "#666" }}>
            Nenhuma entidade encontrada.
          </p>
          <p style={{ color: "#999" }}>
            Seja o primeiro a registrar uma memória desta cidade!
          </p>
          <Link href={`/indicar-entidade?cidadeId=${cidadeId}`}>
            <button
              style={{
                marginTop: "16px",
                padding: "12px 24px",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              Registrar Primeira Memória
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}

export default function EntidadesPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <EntidadesContent />
    </Suspense>
  );
}
