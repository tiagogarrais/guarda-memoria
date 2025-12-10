"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import UploadForm from "./UploadForm";

export default function MediaFeed({ refreshTrigger, cityId }) {
  const [medias, setMedias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState(null); // Estado para controlar resposta

  // Função helper para traduzir tipo de mídia e verbo
  const getMediaInfo = (type) => {
    switch (type) {
      case "image":
        return { type: "Imagem", verb: "enviada" };
      case "video":
        return { type: "Vídeo", verb: "enviado" };
      case "audio":
        return { type: "Áudio", verb: "enviado" };
      case "text":
        return { type: "Texto", verb: "enviado" };
      default:
        return { type: type, verb: "enviado" };
    }
  };

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
            <div
              key={media.id}
              id={`media-${media.id}`}
              className="border rounded p-4 bg-white shadow-sm"
            >
              {/* Título da postagem */}
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  <a
                    href={`#media-${media.id}`}
                    className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      // Scroll suave para o elemento
                      const element = document.getElementById(
                        `media-${media.id}`
                      );
                      if (element) {
                        element.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                      }
                    }}
                  >
                    {getMediaInfo(media.type).type}{" "}
                    {getMediaInfo(media.type).verb} por{" "}
                    {media.user?.name || "Usuário"} em{" "}
                    {new Date(media.createdAt).toLocaleDateString()}
                  </a>
                </h3>
              </div>

              {/* Mensagem de texto - sempre mostrar se existir */}
              {media.text && (
                <div className="mb-3">
                  <p className="text-gray-800 text-base leading-relaxed">
                    {media.text}
                  </p>
                </div>
              )}

              {/* Imagem */}
              {media.type === "image" && media.url && (
                <div className="mb-3">
                  <Image
                    src={media.url}
                    alt="Mídia"
                    width={600}
                    height={450}
                    className="w-full h-96 object-cover rounded"
                  />
                </div>
              )}

              {/* Vídeo */}
              {media.type === "video" && (
                <div className="mb-3">
                  <video controls className="w-full h-96 object-cover rounded">
                    <source src={media.url} />
                  </video>
                </div>
              )}

              {/* Áudio */}
              {media.type === "audio" && (
                <div className="mb-3">
                  <audio controls className="w-full">
                    <source src={media.url} />
                  </audio>
                </div>
              )}

              {/* Botões de ação */}
              <div className="mt-3 flex items-center space-x-3">
                {/* Botão Eu conheço */}
                <button
                  onClick={() => handleKnowClick(media.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 flex items-center space-x-2 ${
                    media.userKnows
                      ? "bg-green-500 text-white hover:bg-green-600"
                      : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                  }`}
                >
                  <svg
                    className={`w-4 h-4 ${
                      media.userKnows ? "text-white" : "text-gray-500"
                    }`}
                    fill={media.userKnows ? "currentColor" : "none"}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Eu conheço</span>
                  {media.knowledgeCount > 0 && (
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        media.userKnows
                          ? "bg-green-600 text-white"
                          : "bg-gray-300 text-gray-700"
                      }`}
                    >
                      {media.knowledgeCount}
                    </span>
                  )}
                </button>

                {/* Botão para responder */}
                <button
                  onClick={() => handleReply(media.id)}
                  className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center space-x-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <span>Entrar na conversa</span>
                </button>
              </div>

              {/* Formulário de resposta inline */}
              {replyingTo === media.id && (
                <UploadForm
                  onUploadSuccess={handleReplySuccess}
                  userCity={null} // Ou passe a cidade se necessário
                  parentId={media.id}
                />
              )}

              {/* Exibir comentários/respostas */}
              {media.replies && media.replies.length > 0 && (
                <div className="mt-4 border-t pt-4">
                  <h4 className="text-sm font-semibold">Comentários:</h4>
                  {media.replies.map((reply) => (
                    <div key={reply.id} className="mt-2 p-2 bg-gray-50 rounded">
                      {reply.text && (
                        <p className="text-sm mb-1">{reply.text}</p>
                      )}
                      {reply.type === "image" && reply.url && (
                        <Image
                          src={reply.url}
                          alt="Comentário"
                          width={200}
                          height={150}
                          className="w-32 h-20 object-cover rounded"
                        />
                      )}
                      {reply.type === "video" && (
                        <video
                          controls
                          className="w-32 h-20 object-cover rounded"
                        >
                          <source src={reply.url} />
                        </video>
                      )}
                      {reply.type === "audio" && (
                        <audio controls className="w-32">
                          <source src={reply.url} />
                        </audio>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {getMediaInfo(reply.type).type} de{" "}
                        {reply.user?.name || "Usuário"} em{" "}
                        {new Date(reply.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
