"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function FavoriteCitiesSection({ favoriteCities }) {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const handleRemoveFavorite = async (formData) => {
    setSubmitting(true);
    try {
      const response = await fetch("/api/user/remove-favorite-city", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        // Recarregar a página para atualizar a lista
        router.refresh();
      } else {
        console.error("Error removing favorite city");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddFavorite = async (formData) => {
    setSubmitting(true);
    try {
      const response = await fetch("/api/user/add-favorite-city", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        // Recarregar a página para atualizar a lista
        router.refresh();
      } else {
        console.error("Error adding favorite city");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    async function fetchCities() {
      try {
        const response = await fetch("/api/cities-all");
        if (response.ok) {
          const data = await response.json();
          // Filtrar cidades que já são favoritas
          const favoriteIds = new Set(favoriteCities.map((city) => city.id));
          const availableCities = data.filter(
            (city) => !favoriteIds.has(city.id)
          );
          setCities(availableCities);
        }
      } catch (error) {
        console.error("Error fetching cities:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCities();
  }, [favoriteCities]);

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden mt-6">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Cidades Favoritas
        </h2>
        <p className="text-gray-600 mb-4">
          Cidades que você marcou como favoritas para acompanhar facilmente
        </p>
      </div>

      <div className="px-6 py-4">
        {favoriteCities && favoriteCities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favoriteCities.map((city) => (
              <div
                key={city.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <Link
                    href={`/cidade/${city.slug}`}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {city.name}
                  </Link>
                  <p className="text-sm text-gray-500">
                    {city.state.sigla.toUpperCase()}
                  </p>
                </div>
                <form
                  action={`/api/user/remove-favorite-city`}
                  method="POST"
                  className="inline"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    handleRemoveFavorite(formData);
                  }}
                >
                  <input type="hidden" name="cityId" value={city.id} />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="text-red-500 hover:text-red-700 p-1 disabled:opacity-50"
                    title="Remover dos favoritos"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </form>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            Você ainda não tem cidades favoritas.
          </p>
        )}

        {/* Adicionar nova cidade favorita */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Adicionar Cidade Favorita
          </h3>
          <form
            action={`/api/user/add-favorite-city`}
            method="POST"
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              handleAddFavorite(formData);
            }}
          >
            <select
              name="cityId"
              required
              disabled={loading}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            >
              <option value="">
                {loading ? "Carregando cidades..." : "Selecione uma cidade..."}
              </option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name} - {city.state.sigla.toUpperCase()}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={loading || submitting}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-gray-400"
            >
              Adicionar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
