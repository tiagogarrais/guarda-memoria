"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LocationSelector({
  onLocationSelected,
  currentLocation,
}) {
  const [states, setStates] = useState({});
  const [cities, setCities] = useState([]);
  const [selectedState, setSelectedState] = useState(
    currentLocation?.stateId?.toString() || ""
  );
  const [selectedCity, setSelectedCity] = useState(
    currentLocation?.cityId?.toString() || ""
  );
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Carregar dados de estados
    fetch("/api/states")
      .then((res) => res.json())
      .then((data) => {
        setStates(data.states);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao carregar dados de estados:", err);
        setLoading(false);
      });
  }, []);

  // Carregar cidades quando o estado selecionado muda
  useEffect(() => {
    if (selectedState) {
      fetch(`/api/cities?stateId=${selectedState}`)
        .then((res) => res.json())
        .then((data) => {
          setCities(data.cities);
        })
        .catch((err) => {
          console.error("Erro ao carregar cidades:", err);
        });
    } else {
      setCities([]);
    }
  }, [selectedState]);

  const handleStateChange = (e) => {
    const stateId = e.target.value;
    setSelectedState(stateId);
    setSelectedCity(""); // Resetar cidade ao mudar estado
  };

  const handleCityChange = (e) => {
    setSelectedCity(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedState || !selectedCity) return;

    try {
      const response = await fetch("/api/update-location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stateId: parseInt(selectedState),
          cityId: parseInt(selectedCity),
        }),
      });

      if (response.ok) {
        if (onLocationSelected) {
          onLocationSelected();
        } else {
          // Forçar recarga completa para atualizar dados da localização
          window.location.href = "/";
        }
      } else {
        alert("Erro ao salvar localização");
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao salvar localização");
    }
  };

  const filteredCities = cities;

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">
        {currentLocation ? "Trocar Localização" : "Selecione sua localização"}
      </h2>

      {currentLocation && (
        <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>Localização atual:</strong> {currentLocation.cityName}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Estado
          </label>
          <select
            value={selectedState}
            onChange={handleStateChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Selecione um estado</option>
            {Object.entries(states).map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Cidade
          </label>
          <select
            value={selectedCity}
            onChange={handleCityChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!selectedState}
            required
          >
            <option value="">Selecione uma cidade</option>
            {filteredCities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-3"
          disabled={!selectedState || !selectedCity}
        >
          {currentLocation ? "Trocar Localização" : "Salvar Localização"}
        </button>

        {currentLocation && (
          <button
            type="button"
            onClick={() => router.push("/")}
            className="w-full bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Cancelar
          </button>
        )}
      </form>
    </div>
  );
}
