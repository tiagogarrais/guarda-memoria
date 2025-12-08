"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";

export default function MediaFeed({ refreshTrigger, cityId }) {
  const [medias, setMedias] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMedias = useCallback(async () => {
    try {
      const url = cityId ? `/api/media?cityId=${cityId}` : "/api/media";
      const response = await fetch(url);
      const data = await response.json();
      if (response.ok) {
        setMedias(data.medias);
      }
    } catch (error) {
      console.error("Error fetching medias:", error);
    } finally {
      setLoading(false);
    }
  }, [cityId]);

  useEffect(() => {
    fetchMedias();
  }, [fetchMedias, refreshTrigger]);

  if (loading) return <p>Carregando...</p>;

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-4">
        {cityId ? "Feed da Cidade" : "Seu Feed de Memórias"}
      </h2>
      {medias.length === 0 ? (
        <p>
          {cityId
            ? "Nenhuma mídia nesta cidade ainda."
            : "Nenhuma mídia enviada ainda."}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {medias.map((media) => (
            <div key={media.id} className="border rounded p-4">
              {media.type === "image" && (
                <Image
                  src={media.url}
                  alt="Mídia"
                  width={400}
                  height={300}
                  className="w-full h-48 object-cover rounded"
                />
              )}
              {media.type === "video" && (
                <video controls className="w-full h-48 object-cover rounded">
                  <source src={media.url} />
                </video>
              )}
              {media.type === "audio" && (
                <audio controls className="w-full">
                  <source src={media.url} />
                </audio>
              )}
              <div className="mt-2 text-sm text-gray-600">
                <p>Por: {media.user?.name || "Usuário"}</p>
                <p>Em: {new Date(media.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
