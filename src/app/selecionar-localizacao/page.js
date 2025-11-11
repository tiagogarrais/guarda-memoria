"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function SelecionarLocalizacao() {
  const { data: session } = useSession();
  const router = useRouter();
  const [estado, setEstado] = useState("");
  const [cidade, setCidade] = useState("");
  const [cidadesDisponiveis, setCidadesDisponiveis] = useState([]);
  const [estadosCidades, setEstadosCidades] = useState({
    states: {},
    cities: [],
  });

  useEffect(() => {
    if (!session) {
      router.push("/");
    }
  }, [session, router]);

  useEffect(() => {
    const fetchEstadosCidades = async () => {
      try {
        const res = await fetch("/estados-cidades2.json");
        if (res.ok) {
          const data = await res.json();
          setEstadosCidades(data);
        }
      } catch (error) {
        console.error("Erro ao buscar estados e cidades:", error);
      }
    };

    fetchEstadosCidades();
  }, []);

  useEffect(() => {
    if (estado) {
      // Filtrar cidades pelo state_id
      const cidades = estadosCidades.cities
        .filter((c) => c.state_id === parseInt(estado))
        .map((c) => c.name);
      setCidadesDisponiveis(cidades);
      setCidade(""); // Reset cidade ao mudar estado
    } else {
      setCidadesDisponiveis([]);
    }
  }, [estado]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!estado || !cidade) {
      alert("Selecione estado e cidade.");
      return;
    }

    try {
      const response = await fetch(
        `/api/cidades?estado=${estado}&nome=${encodeURIComponent(cidade)}`
      );
      if (!response.ok) {
        throw new Error("Erro ao buscar cidade");
      }
      const cidadeData = await response.json();

      // Salvar cidade selecionada no localStorage
      localStorage.setItem(
        "cidadeSelecionada",
        JSON.stringify({
          id: cidadeData.id,
          nome: cidadeData.nome,
          estado: cidadeData.estado,
        })
      );

      // Redirecionar para /entidades?cidadeId=...
      router.push(`/entidades?cidadeId=${cidadeData.id}`);
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao selecionar localização. Tente novamente.");
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
      <h1>Selecionar Localização</h1>
      <p>
        Escolha o estado e a cidade para ver as pessoas cadastradas e
        contribuir.
      </p>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "16px" }}
      >
        <div>
          <label htmlFor="estado">Estado:</label>
          <select
            id="estado"
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: 4,
            }}
          >
            <option value="">Selecione um estado</option>
            {Object.entries(estadosCidades.states).map(([codigo, nome]) => (
              <option key={codigo} value={codigo}>
                {nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="cidade">Cidade:</label>
          <select
            id="cidade"
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
            required
            disabled={!estado}
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: 4,
            }}
          >
            <option value="">Selecione uma cidade</option>
            {cidadesDisponiveis.map((nomeCidade) => (
              <option key={nomeCidade} value={nomeCidade}>
                {nomeCidade}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          style={{
            padding: "12px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          Continuar
        </button>
      </form>
    </div>
  );
}
