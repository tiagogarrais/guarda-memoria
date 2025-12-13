"use client";

import { useState } from "react";

export default function DisplayNameForm({ currentDisplayName, userName }) {
  const [displayName, setDisplayName] = useState(currentDisplayName || "");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    // Validação no frontend
    const trimmedName = displayName.trim();
    if (!trimmedName) {
      setError("Nome de exibição não pode estar vazio");
      setLoading(false);
      return;
    }

    if (trimmedName.length > 50) {
      setError("Nome de exibição deve ter no máximo 50 caracteres");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/user/update-display-name", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          displayName: trimmedName,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Nome de exibição atualizado com sucesso!");
        // Limpar mensagem de sucesso após 3 segundos
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.error || "Erro ao atualizar nome de exibição");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Nome de Exibição
      </label>
      <p className="text-sm text-gray-500 mb-2">
        Como você será chamado no site. Se não definido, usaremos seu nome do
        Google.
      </p>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1">
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder={userName || "Digite seu nome de exibição"}
            className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
              error
                ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300"
            }`}
            disabled={loading}
          />
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          {success && <p className="mt-1 text-sm text-green-600">{success}</p>}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? "Salvando..." : "Salvar"}
        </button>
      </form>
    </div>
  );
}
