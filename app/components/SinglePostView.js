"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import UploadForm from "./UploadForm";

export default function SinglePostView({ post, user, citySlug }) {
  const [replyingTo, setReplyingTo] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPost, setCurrentPost] = useState(post);
  const replyFormRef = useRef(null);
  const { data: session, status } = useSession();

  // Scroll para o formulário quando replyingTo for definido
  useEffect(() => {
    if (replyingTo && replyFormRef.current) {
      replyFormRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [replyingTo]);

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

        // Função para atualizar conhecimento recursivamente
        const updateKnowledgeRecursive = (media) => {
          if (media.id === mediaId) {
            return {
              ...media,
              knowledgeCount: result.knowledgeCount,
              userKnows: result.userKnows,
              score: result.score,
            };
          }

          if (media.replies && media.replies.length > 0) {
            return {
              ...media,
              replies: media.replies.map(updateKnowledgeRecursive),
            };
          }

          return media;
        };

        // Atualizar o estado local da postagem
        setCurrentPost(updateKnowledgeRecursive);
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
          // Redirecionar para a página da cidade
          window.location.href = `/cidade/${citySlug}`;
        } else {
          alert("Erro ao apagar a publicação");
        }
      } catch (error) {
        console.error("Erro de rede:", error);
      }
    }
  };

  const renderMedia = (media, isReply = false) => {
    const isOwner = session?.user?.email && media.userId === user.id;

    return (
      <div
        key={media.id}
        className={`bg-white rounded-lg shadow-md p-6 mb-6 ${
          isReply ? "ml-8 border-l-4 border-blue-200" : ""
        }`}
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
                {getMediaInfo(media.type).type} {getMediaInfo(media.type).verb}{" "}
                em{" "}
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

          {/* Botão de deletar no header */}
          {isOwner && (
            <button
              onClick={() => handleDelete(media.id)}
              className="text-gray-400 hover:text-red-500 text-lg"
              title="Apagar publicação"
            >
              🗑️
            </button>
          )}
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
                onClick={() => {
                  setSelectedImage(media.url);
                  setIsModalOpen(true);
                }}
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

        {/* Categorias */}
        {media.categories && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {JSON.parse(media.categories).map((category, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Botões de ação */}
        {!isReply && (
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
        )}

        {/* Formulário de resposta */}
        {replyingTo === media.id && (
          <div
            ref={replyFormRef}
            className="mt-4 bg-gray-50 rounded-lg p-4 border-l-4 border-blue-200"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Entrar na conversa
            </h3>
            <UploadForm
              onUploadSuccess={() => {
                setReplyingTo(null);
                // Recarregar a página para mostrar a nova resposta
                window.location.reload();
              }}
              userCity={{
                id: media.cityId,
                name: media.city.name,
                stateSigla: media.city.state.sigla,
              }}
              parentId={media.id}
              isReply={true}
            />
            <button
              onClick={() => setReplyingTo(null)}
              className="mt-4 text-gray-500 hover:text-gray-700 text-sm"
            >
              Cancelar
            </button>
          </div>
        )}

        {/* Respostas */}
        {media.replies && media.replies.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              {media.replies.length} resposta
              {media.replies.length !== 1 ? "s" : ""}
            </h4>
            <div className="space-y-4">
              {media.replies.map((reply) => renderMedia(reply, true))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Postagem principal */}
      {renderMedia(currentPost)}

      {/* Modal para imagem ampliada */}
      {isModalOpen && selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setIsModalOpen(false)}
        >
          <div className="max-w-4xl max-h-screen p-4">
            <Image
              src={selectedImage}
              alt="Imagem ampliada"
              width={1200}
              height={800}
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}
