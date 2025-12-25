"use client";

import { useEffect, useState, useCallback } from "react";
import PostCard from "./PostCard";

export default function MediaFeed({ refreshTrigger, cityId }) {
  const [medias, setMedias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState(null); // Estado para controlar resposta

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

  const handleReply = (mediaId) => {
    setReplyingTo(mediaId);
  };

  const handleKnowClick = async (mediaId) => {
    try {
      const response = await fetch(`/api/media/${mediaId}/knowledge`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();

        // Atualizar o estado local da mídia
        setMedias((prevMedias) =>
          prevMedias.map((media) =>
            media.id === mediaId
              ? {
                  ...media,
                  knowledgeCount: result.knowledgeCount,
                  userKnows: result.userKnows,
                  score: result.score,
                }
              : media
          )
        );
      } else {
        console.error("Erro ao processar conhecimento");
      }
    } catch (error) {
      console.error("Erro de rede:", error);
    }
  };

  const handleDelete = async (mediaId) => {
    if (window.confirm("Tem certeza que deseja apagar esta publicação?")) {
      try {
        const response = await fetch(`/api/media/${mediaId}`, {
          method: "DELETE",
        });
        if (response.ok) {
          // Recarregar o feed após deletar
          fetchMedias();
        } else {
          alert("Erro ao apagar a publicação");
        }
      } catch (error) {
        console.error("Erro ao deletar:", error);
        alert("Erro ao apagar a publicação");
      }
    }
  };

  const handleReplySuccess = () => {
    setReplyingTo(null);
    fetchMedias(); // Recarregar feed após resposta
  };

  if (loading) return <p>Carregando...</p>;

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-4 text-center">
        {cityId ? "Memórias da Cidade" : "Suas memórias"}
      </h2>
      {medias.length === 0 ? (
        <p>
          {cityId
            ? "Nenhuma mídia nesta cidade ainda."
            : "Nenhuma mídia enviada ainda."}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {medias.map((media) => (
            <PostCard
              key={media.id}
              media={media}
              onDelete={handleDelete}
              onKnowClick={handleKnowClick}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              onReplySuccess={handleReplySuccess}
            />
          ))}
        </div>
      )}
    </div>
  );
}
