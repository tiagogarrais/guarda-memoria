"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

export const dynamic = "force-dynamic";

function PessoasContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const cidadeId = searchParams.get("cidadeId");

  const [pessoas, setPessoas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cidadeNome, setCidadeNome] = useState("");

  const [filtros, setFiltros] = useState({
    search: "",
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
    fetchPessoas();
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

  const fetchPessoas = async () => {
    try {
      const params = new URLSearchParams({ cidadeId });
      if (filtros.search) params.append("search", filtros.search);
      if (filtros.categoria) params.append("categoria", filtros.categoria);
      if (filtros.profissao) params.append("profissao", filtros.profissao);
      if (filtros.dataInicio) params.append("dataInicio", filtros.dataInicio);
      if (filtros.dataFim) params.append("dataFim", filtros.dataFim);

      const response = await fetch(`/api/pessoas?${params}`);
      if (!response.ok) throw new Error("Erro ao buscar pessoas");
      const data = await response.json();

      // Filtrar pessoas com IDs válidos
      const pessoasValidas = data.filter(
        (pessoa) =>
          pessoa.id &&
          typeof pessoa.id === "string" &&
          pessoa.id.length > 0 &&
          !pessoa.id.includes("<") &&
          !pessoa.id.includes(">")
      );

      setPessoas(pessoasValidas);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!session || !cidadeId) {
    return <div>Carregando...</div>;
  }

  if (loading) return <div>Carregando pessoas...</div>;
  if (error) return <div>Erro: {error}</div>;

  const top3 = pessoas.slice(0, 3);
  const resto = pessoas.slice(3);

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "24px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>Pessoas de {cidadeNome || "sua cidade"}</h1>
      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={() => {
            localStorage.removeItem("cidadeSelecionada");
            router.push("/selecionar-localizacao");
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
          Trocar Cidade
        </button>
        <Link href={`/indicar-pessoa?cidadeId=${cidadeId}`}>
          <button
            style={{
              padding: "8px 16px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
              marginLeft: "10px",
            }}
          >
            Indicar Pessoa
          </button>
        </Link>
        <button
          onClick={() => setMostrarFiltros(!mostrarFiltros)}
          style={{
            padding: "8px 16px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
            marginLeft: "10px",
          }}
        >
          {mostrarFiltros ? "Ocultar Filtros" : "Mostrar Filtros"}
        </button>
      </div>

      {/* Filtros */}
      {mostrarFiltros && (
        <div
          style={{
            marginBottom: "20px",
            padding: "16px",
            border: "1px solid #ddd",
            borderRadius: "8px",
          }}
        >
          <h3>Filtros Avançados</h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "16px",
            }}
          >
            <input
              type="text"
              placeholder="Buscar por nome, história ou tags"
              value={filtros.search}
              onChange={(e) =>
                setFiltros({ ...filtros, search: e.target.value })
              }
              style={{
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: 4,
              }}
            />
            <select
              value={filtros.categoria}
              onChange={(e) =>
                setFiltros({ ...filtros, categoria: e.target.value })
              }
              style={{
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: 4,
              }}
            >
              <option value="">Todas as categorias</option>
              <option value="artista">Artista</option>
              <option value="líder comunitário">Líder Comunitário</option>
              <option value="educador">Educador</option>
              <option value="atleta">Atleta</option>
              <option value="empresário">Empresário</option>
              <option value="outro">Outro</option>
            </select>
            <input
              type="text"
              placeholder="Profissão"
              value={filtros.profissao}
              onChange={(e) =>
                setFiltros({ ...filtros, profissao: e.target.value })
              }
              style={{
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: 4,
              }}
            />
            <input
              type="date"
              placeholder="Data de nascimento início"
              value={filtros.dataInicio}
              onChange={(e) =>
                setFiltros({ ...filtros, dataInicio: e.target.value })
              }
              style={{
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: 4,
              }}
            />
            <input
              type="date"
              placeholder="Data de nascimento fim"
              value={filtros.dataFim}
              onChange={(e) =>
                setFiltros({ ...filtros, dataFim: e.target.value })
              }
              style={{
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: 4,
              }}
            />
          </div>
          <button
            onClick={() =>
              setFiltros({
                search: "",
                categoria: "",
                profissao: "",
                dataInicio: "",
                dataFim: "",
              })
            }
            style={{
              padding: "8px 16px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
              marginTop: "10px",
            }}
          >
            Limpar Filtros
          </button>
        </div>
      )}

      {/* Pódio */}
      {top3.length > 0 && (
        <section style={{ marginBottom: "40px" }}>
          <h2>Pódio</h2>
          <div
            style={{ display: "flex", justifyContent: "center", gap: "20px" }}
          >
            {top3.map((pessoa, index) => (
              <div
                key={pessoa.id}
                style={{
                  textAlign: "center",
                  padding: "20px",
                  border: "2px solid #ddd",
                  borderRadius: "8px",
                  backgroundColor:
                    index === 0
                      ? "#ffd700"
                      : index === 1
                      ? "#c0c0c0"
                      : "#cd7f32",
                  minWidth: "150px",
                }}
              >
                <h3>{index + 1}º Lugar</h3>
                <p>
                  <strong>{pessoa.nome}</strong>
                </p>
                {pessoa.fotoUrl && (
                  <img
                    src={pessoa.fotoUrl}
                    alt={pessoa.nome}
                    style={{
                      width: "100px",
                      height: "100px",
                      objectFit: "cover",
                      borderRadius: "50%",
                    }}
                  />
                )}
                <p>Score: {pessoa.score}</p>
                <Link href={`/pessoa/${pessoa.id}`}>
                  <button
                    style={{
                      padding: "6px 12px",
                      backgroundColor: "#007bff",
                      color: "white",
                      border: "none",
                      borderRadius: 4,
                      cursor: "pointer",
                    }}
                    disabled={
                      !pessoa.id ||
                      pessoa.id.includes("<") ||
                      pessoa.id.includes(">")
                    }
                  >
                    Ver Detalhes
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Lista de Pessoas */}
      <section>
        <h2>Todas as Pessoas</h2>
        {pessoas.length === 0 ? (
          <p>
            Nenhuma pessoa cadastrada ainda. Seja o primeiro a indicar alguém!
          </p>
        ) : (
          <div style={{ display: "grid", gap: "16px" }}>
            {resto.map((pessoa) => (
              <div
                key={pessoa.id}
                style={{
                  padding: "16px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <h3>{pessoa.nome}</h3>
                  <p>Indicado por: {pessoa.usuario?.fullName || "Anônimo"}</p>
                  <p>Score: {pessoa.score}</p>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <Link href={`/pessoa/${pessoa.id}`}>
                    <button
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: 4,
                        cursor: "pointer",
                      }}
                      disabled={
                        !pessoa.id ||
                        pessoa.id.includes("<") ||
                        pessoa.id.includes(">")
                      }
                    >
                      Ver Detalhes
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default function Pessoas() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <PessoasContent />
    </Suspense>
  );
}
