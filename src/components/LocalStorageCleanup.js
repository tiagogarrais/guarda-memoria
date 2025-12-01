"use client";

import { useEffect } from "react";

export default function LocalStorageCleanup() {
  useEffect(() => {
    // Limpar dados antigos do localStorage apenas uma vez
    if (typeof window !== "undefined") {
      const cleaned = localStorage.getItem("localStorageCleaned");
      if (!cleaned) {
        // Limpar dados antigos
        localStorage.removeItem("cidadeSelecionada");

        // Marcar como limpo
        localStorage.setItem("localStorageCleaned", "true");

        console.log("LocalStorage limpo de dados antigos");
      }
    }
  }, []);

  return null; // Componente não renderiza nada
}
