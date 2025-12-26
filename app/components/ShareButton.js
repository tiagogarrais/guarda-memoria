"use client";

import { useState } from "react";

export default function ShareButton({
  url,
  title = "Guarda Memória",
  text = "Confira esta memória",
}) {
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    setIsSharing(true);

    try {
      if (navigator.share) {
        await navigator.share({
          title,
          text,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        alert("Link copiado para a área de transferência!");
      }
    } catch (error) {
      console.error("Erro ao compartilhar:", error);
      // Fallback: tentar copiar para clipboard
      try {
        await navigator.clipboard.writeText(url);
        alert("Link copiado para a área de transferência!");
      } catch (clipboardError) {
        alert("Erro ao copiar link. URL: " + url);
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <button
      onClick={handleShare}
      disabled={isSharing}
      className="text-gray-600 hover:text-gray-800 p-1 disabled:opacity-50"
      title="Compartilhar"
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
          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
        />
      </svg>
    </button>
  );
}
