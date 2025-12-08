"use client";

import { useState } from "react";

export default function UploadForm({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setMessage("Upload realizado com sucesso!");
        setFile(null);
        // Limpar a mensagem após 3 segundos
        setTimeout(() => setMessage(""), 3000);
        // Notificar o componente pai para atualizar o feed
        if (onUploadSuccess) {
          onUploadSuccess();
        }
        // Aqui você pode atualizar o feed ou redirecionar
      } else {
        setMessage(result.error || "Erro no upload");
      }
    } catch (error) {
      setMessage("Erro de conexão");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mt-8 p-4 border rounded">
      <h2 className="text-lg font-semibold mb-4">Enviar Mídia</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="file"
          accept="image/*,video/*,audio/*"
          onChange={(e) => setFile(e.target.files[0])}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        <button
          type="submit"
          disabled={!file || uploading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {uploading ? "Enviando..." : "Enviar"}
        </button>
      </form>
      {message && <p className="mt-2 text-sm">{message}</p>}
    </div>
  );
}
