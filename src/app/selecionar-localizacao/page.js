"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import SiteHeader from "@/components/SiteHeader";

export default function SelecionarLocalizacao() {
  const { data: session } = useSession();
  const router = useRouter();
  const [estado, setEstado] = useState("");
  const [cidade, setCidade] = useState("");
  const [cidadesDisponiveis, setCidadesDisponiveis] = useState([]);
  const [cidadesFavoritas, setCidadesFavoritas] = useState([]); // Cidades favoritas do usuário
  const [estadosCidades, setEstadosCidades] = useState({
    states: {},
    cities: [],
  });

  useEffect(() => {
    if (!session) {
      router.push("/");
    }
  }, [session, router]);

  // Buscar cidades favoritas do usuário logado
  useEffect(() => {
    const fetchCidadesFavoritas = async () => {
      if (!session) return;

      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          const favoritas = data.user.cidadesFavoritas || [];
          setCidadesFavoritas(favoritas);
        }
      } catch (error) {
        console.error("Erro ao buscar cidades favoritas:", error);
      }
    };

    fetchCidadesFavoritas();
  }, [session]);

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

      // Não precisamos mais salvar no localStorage
      // O Context agora gerencia o estado baseado na URL

      // Redirecionar diretamente para /memorias/slug
      router.push(`/memorias/${cidadeData.slug}`);
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao selecionar localização. Tente novamente.");
    }
  };

  // Função para navegar para cidade favorita
  const handleCidadeFavorita = async (cidade) => {
    try {
      const response = await fetch(
        `/api/cidades?estado=${cidade.stateId}&nome=${encodeURIComponent(cidade.cityName)}`
      );
      if (!response.ok) {
        throw new Error("Erro ao buscar cidade");
      }
      const cidadeData = await response.json();
      router.push(`/memorias/${cidadeData.slug}`);
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao acessar cidade favorita. Tente novamente.");
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
      {/* Header Geral do Site */}
      <SiteHeader />

      <h1>Selecionar Localização</h1>
      <p>
        Escolha o estado e a cidade para ver as pessoas cadastradas e
        contribuir.
      </p>

      {/* Seção de Cidades Favoritas */}
      {cidadesFavoritas && cidadesFavoritas.length > 0 && (
        <div
          style={{
            marginBottom: "32px",
            padding: "16px",
            backgroundColor: "#f8f9fa",
            borderRadius: 8,
            border: "1px solid #dee2e6",
          }}
        >
          <h3 style={{ marginTop: 0, color: "#495057" }}>
            ⭐ Suas Cidades Favoritas
          </h3>
          <p style={{ fontSize: "14px", color: "#6c757d", marginBottom: "12px" }}>
            Acesse rapidamente suas cidades favoritas:
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {cidadesFavoritas.map((cidade, index) => (
              <button
                key={index}
                onClick={() => handleCidadeFavorita(cidade)}
                style={{
                  padding: "8px 12px",
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                  fontSize: "14px",
                  transition: "background-color 0.2s",
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = "#0056b3";
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = "#007bff";
                }}
              >
                📍 {cidade.cityName} - {cidade.stateName}
              </button>
            ))}
          </div>
        </div>
      )}

      <h3>Ou selecione uma nova localização:</h3>

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
