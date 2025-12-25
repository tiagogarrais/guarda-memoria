"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import UploadForm from "./UploadForm";

export default function PostCard({
  media,
  isReply = false,
  onDelete,
  onKnowClick,
  replyingTo,
  setReplyingTo,
  onReplySuccess,
  citySlug,
  openModal,
}) {
  const [currentMedia, setCurrentMedia] = useState(media);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const replyFormRef = useRef(null);
  const { data: session, status } = useSession();

  // Scroll para o formulário quando replyingTo for definido
  useEffect(() => {
    if (replyingTo === currentMedia.id && replyFormRef.current) {
      replyFormRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [replyingTo, currentMedia.id]);

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

  const handleKnowClickInternal = async (mediaId) => {
    if (onKnowClick) {
      await onKnowClick(mediaId);
      // Atualizar local se necessário
      // Assumindo que onKnowClick atualiza o estado no pai
    } else {
      // Lógica local se não passada
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
          setCurrentMedia(updateKnowledgeRecursive);
        } else {
          console.error("Erro ao processar conhecimento");
        }
      } catch (error) {
        console.error("Erro de rede:", error);
      }
    }
  };

  const handleDeleteInternal = async (mediaId) => {
    if (onDelete) {
      await onDelete(mediaId);
    } else {
      if (window.confirm("Tem certeza que deseja apagar esta publicação?")) {
        try {
          const response = await fetch(`/api/media/${mediaId}`, {
            method: "DELETE",
          });
          if (response.ok) {
            if (citySlug) {
              // Para single post, redirecionar
              window.location.href = `/cidade/${citySlug}`;
            } else {
              // Para feed, recarregar ou algo, mas aqui não faz nada
            }
          } else {
            alert("Erro ao apagar a publicação");
          }
        } catch (error) {
          console.error("Erro de rede:", error);
          alert("Erro ao apagar a publicação");
        }
      }
    }
  };

  const handleReplySuccessInternal = () => {
    setReplyingTo(null);
    if (onReplySuccess) {
      onReplySuccess();
    } else {
      // Recarregar a página para mostrar a nova resposta
      window.location.reload();
    }
  };

  const openModalInternal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setIsModalOpen(true);
    document.body.style.overflow = "hidden"; // Lock scroll
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
    document.body.style.overflow = "auto"; // Unlock scroll
  };

  return (
    <>
      <div
        className={`bg-white rounded-lg shadow-md p-6 mb-6 ${
          isReply ? "ml-8 border-l-4 border-blue-200" : ""
        }`}
      >
        {/* Header da postagem */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div
              className={`w-${isReply ? "8" : "10"} h-${
                isReply ? "8" : "10"
              } bg-blue-500 rounded-full flex items-center justify-center text-white font-bold ${
                isReply ? "text-sm" : ""
              }`}
            >
              {(currentMedia.user?.displayName ||
                currentMedia.user?.name ||
                "U")[0].toUpperCase()}
            </div>
            <div>
              <p
                className={`font-semibold text-gray-900 ${
                  isReply ? "text-sm" : ""
                }`}
              >
                {currentMedia.user?.displayName ||
                  currentMedia.user?.name ||
                  "Usuário"}
              </p>
              <p className={`text-${isReply ? "xs" : "sm"} text-gray-500`}>
                {getMediaInfo(currentMedia.type).type}{" "}
                {getMediaInfo(currentMedia.type).verb} em{" "}
                {new Date(currentMedia.createdAt).toLocaleDateString("pt-BR", {
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
            {currentMedia.permalink && !isReply && (
              <button
                onClick={() =>
                  (window.location.href = `/postagem/${currentMedia.permalink}/qr`)
                }
                className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                title="Gerar QR Code"
              >
                Gerar QR-Code
              </button>
            )}
            {status === "authenticated" &&
              session?.user?.id == currentMedia.userId && (
                <button
                  onClick={() => handleDeleteInternal(currentMedia.id)}
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
          {currentMedia.text && (
            <div className="mb-4">
              <p
                className={`text-gray-800 whitespace-pre-wrap ${
                  isReply ? "text-sm" : "text-lg"
                } leading-relaxed`}
              >
                {currentMedia.text}
              </p>
            </div>
          )}

          {/* Conteúdo visual depois */}
          {currentMedia.type === "image" && currentMedia.url && (
            <div className="relative">
              <Image
                src={currentMedia.url}
                alt={currentMedia.text || "Imagem"}
                width={800}
                height={600}
                className={`w-full h-auto rounded-lg cursor-pointer ${
                  isReply ? "max-h-48 object-contain" : ""
                }`}
                onClick={() => openModalInternal(currentMedia.url)}
              />
            </div>
          )}

          {currentMedia.type === "video" && currentMedia.url && (
            <video
              controls
              className={`w-full rounded-lg ${
                isReply ? "max-h-48 object-contain" : ""
              }`}
            >
              <source src={currentMedia.url} type="video/mp4" />
              Seu navegador não suporta o elemento de vídeo.
            </video>
          )}

          {currentMedia.type === "audio" && currentMedia.url && (
            <audio controls className="w-full">
              <source src={currentMedia.url} type="audio/mpeg" />
              Seu navegador não suporta o elemento de áudio.
            </audio>
          )}
        </div>

        {/* Categorias */}
        {currentMedia.categories && !isReply && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {JSON.parse(currentMedia.categories).map((category, index) => (
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
              onClick={() => handleKnowClickInternal(currentMedia.id)}
              className={`px-3 sm:px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 flex items-center space-x-2 ${
                currentMedia.userKnows
                  ? "bg-green-500 text-white hover:bg-green-600"
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              }`}
            >
              <svg
                className={`w-4 h-4 ${
                  currentMedia.userKnows ? "text-white" : "text-gray-500"
                }`}
                fill={currentMedia.userKnows ? "currentColor" : "none"}
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
              {currentMedia.knowledgeCount > 0 && (
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    currentMedia.userKnows
                      ? "bg-green-600 text-white"
                      : "bg-gray-300 text-gray-700"
                  }`}
                >
                  {currentMedia.knowledgeCount}
                </span>
              )}
            </button>

            {/* Botão para responder */}
            <button
              onClick={() => handleReply(currentMedia.id)}
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
        {replyingTo === currentMedia.id && !isReply && (
          <div
            ref={replyFormRef}
            className="mt-4 bg-gray-50 rounded-lg p-4 border-l-4 border-blue-200"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Entrar na conversa
            </h3>
            <UploadForm
              onUploadSuccess={handleReplySuccessInternal}
              userCity={{
                id: currentMedia.cityId,
                name: currentMedia.city.name,
                stateSigla: currentMedia.city.state.sigla,
              }}
              parentId={currentMedia.id}
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
        {currentMedia.replies && currentMedia.replies.length > 0 && (
          <div className="mt-6">
            <h4
              className={`text-${
                isReply ? "xs" : "sm"
              } font-semibold text-gray-700 mb-3`}
            >
              {currentMedia.replies.length} resposta
              {currentMedia.replies.length !== 1 ? "s" : ""}
            </h4>
            <div className="space-y-4">
              {currentMedia.replies.map((reply) => (
                <PostCard
                  key={reply.id}
                  media={reply}
                  isReply={true}
                  onDelete={onDelete}
                  onKnowClick={onKnowClick}
                  replyingTo={replyingTo}
                  setReplyingTo={setReplyingTo}
                  onReplySuccess={onReplySuccess}
                  citySlug={citySlug}
                />
              ))}
            </div>
          </div>
        )}
      </div>

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
    </>
  );
}
