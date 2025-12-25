"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import UploadForm from "./UploadForm";

export default function MediaFeed({ refreshTrigger, cityId }) {
  const [medias, setMedias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState(null); // Estado para controlar resposta
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: session, status } = useSession();

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

  const openModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setIsModalOpen(true);
    document.body.style.overflow = "hidden"; // Lock scroll
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
    document.body.style.overflow = "auto"; // Unlock scroll
  };

  // Close modal on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isModalOpen) {
        closeModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen]);

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
              className="bg-white rounded-lg shadow-md p-6 mb-6 relative"
            >
              {/* Header da postagem */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                    {(media.user?.displayName ||
                      media.user?.name ||
                      "U")[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {media.user?.displayName || media.user?.name || "Usuário"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {getMediaInfo(media.type).type}{" "}
                      {getMediaInfo(media.type).verb} em{" "}
                      {new Date(media.createdAt).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>

                {/* Botões no header */}
                <div className="flex space-x-2">
                  {media.permalink && (
                    <button
                      onClick={() =>
                        (window.location.href = `/postagem/${media.permalink}/qr`)
                      }
                      className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                      title="Gerar QR Code"
                    >
                      Gerar QR-Code
                    </button>
                  )}
                  {status === "authenticated" &&
                    session?.user?.id == media.userId && (
                      <button
                        onClick={() => handleDelete(media.id)}
                        className="text-gray-400 hover:text-red-500 text-lg"
                        title="Apagar publicação"
                      >
                        🗑️
                      </button>
                    )}
                </div>
              </div>

              {/* Conteúdo da mídia */}
              <div className="mb-4">
                {/* Texto primeiro */}
                {media.text && (
                  <div className="mb-4">
                    <p className="text-gray-800 whitespace-pre-wrap text-lg leading-relaxed">
                      {media.text}
                    </p>
                  </div>
                )}

                {/* Conteúdo visual depois */}
                {media.type === "image" && media.url && (
                  <div className="relative">
                    <Image
                      src={media.url}
                      alt={media.text || "Imagem"}
                      width={800}
                      height={600}
                      className="w-full h-auto rounded-lg cursor-pointer"
                      onClick={() => openModal(media.url)}
                    />
                  </div>
                )}

                {media.type === "video" && media.url && (
                  <video controls className="w-full rounded-lg">
                    <source src={media.url} type="video/mp4" />
                    Seu navegador não suporta o elemento de vídeo.
                  </video>
                )}

                {media.type === "audio" && media.url && (
                  <audio controls className="w-full">
                    <source src={media.url} type="audio/mpeg" />
                    Seu navegador não suporta o elemento de áudio.
                  </audio>
                )}
              </div>

              {/* Botões de ação */}
              <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                {/* Botão Eu conheço */}
                <button
                  onClick={() => handleKnowClick(media.id)}
                  className={`px-3 sm:px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 flex items-center space-x-2 ${
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
                  className="px-3 sm:px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center space-x-2"
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
                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">
                    {media.replies.length} resposta
                    {media.replies.length !== 1 ? "s" : ""}
                  </h4>
                  <div className="space-y-4">
                    {media.replies.map((reply) => (
                      <div
                        key={reply.id}
                        className="bg-white rounded-lg shadow-md p-4 ml-8 border-l-4 border-blue-200 relative"
                      >
                        {status === "authenticated" &&
                          session?.user?.id == reply.userId && (
                            <button
                              onClick={() => handleDelete(reply.id)}
                              className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-lg"
                              title="Apagar comentário"
                            >
                              🗑️
                            </button>
                          )}
                        {/* Header da resposta */}
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {(reply.user?.displayName ||
                              reply.user?.name ||
                              "U")[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">
                              {reply.user?.displayName ||
                                reply.user?.name ||
                                "Usuário"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {getMediaInfo(reply.type).type}{" "}
                              {getMediaInfo(reply.type).verb} em{" "}
                              {new Date(reply.createdAt).toLocaleDateString(
                                "pt-BR",
                                {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </p>
                          </div>
                        </div>
                        {/* Conteúdo da resposta */}
                        {reply.text && (
                          <p className="text-sm mb-2 whitespace-pre-wrap">
                            {reply.text}
                          </p>
                        )}
                        {reply.type === "image" && reply.url && (
                          <Image
                            src={reply.url}
                            alt="Comentário"
                            width={300}
                            height={225}
                            className="w-full max-h-48 object-contain rounded-lg cursor-pointer"
                            onClick={() => openModal(reply.url)}
                          />
                        )}
                        {reply.type === "video" && (
                          <video
                            controls
                            className="w-full max-h-48 object-contain rounded-lg"
                          >
                            <source src={reply.url} />
                          </video>
                        )}
                        {reply.type === "audio" && (
                          <audio controls className="w-full">
                            <source src={reply.url} />
                          </audio>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal para imagem ampliada */}
      {isModalOpen && selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={closeModal}
        >
          <div className="relative max-h-screen max-w-screen p-4">
            <Image
              src={selectedImage}
              alt="Imagem ampliada"
              width={1200}
              height={900}
              className="max-h-[90vh] max-w-full object-contain"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on image
            />
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-white text-2xl bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-75"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
