"use client";

import { useEffect } from "react";

export default function VisitTracker() {
  useEffect(() => {
    // Registrar visita quando a página carrega
    const registerVisit = async () => {
      try {
        const response = await fetch("/api/visit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            path: window.location.pathname,
            source: new URLSearchParams(window.location.search).get("source"),
            userAgent: navigator.userAgent,
          }),
        });

        if (!response.ok) {
          console.error("Erro ao registrar visita");
        }
      } catch (error) {
        console.error("Erro ao registrar visita:", error);
      }
    };

    registerVisit();
  }, []);

  return null; // Este componente não renderiza nada
}
