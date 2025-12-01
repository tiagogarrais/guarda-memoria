"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useParams, usePathname } from "next/navigation";

const CityContext = createContext();

export function CityProvider({ children }) {
  const [currentCity, setCurrentCity] = useState(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const pathname = usePathname();

  // Extrair slug da URL
  const getCitySlugFromUrl = () => {
    // Para rotas como /memorias/[slug], /pessoas/[slug], etc.
    if (params?.slug && typeof params.slug === "string") {
      return params.slug;
    }

    // Para outras rotas, tentar extrair da URL
    const pathParts = pathname.split("/");
    const slugRoutes = ["memorias", "pessoas", "memoria", "pessoa"];

    for (let i = 0; i < pathParts.length - 1; i++) {
      if (slugRoutes.includes(pathParts[i]) && pathParts[i + 1]) {
        return pathParts[i + 1];
      }
    }

    return null;
  };

  // Buscar dados da cidade baseado no slug
  const fetchCityBySlug = async (slug) => {
    if (!slug) return null;

    try {
      setLoading(true);
      const response = await fetch(`/api/countries/slug/${slug}`);
      if (!response.ok) throw new Error("Cidade não encontrada");

      const data = await response.json();
      if (data.success) {
        return data.cidade;
      } else {
        throw new Error(data.error || "Cidade não encontrada");
      }
    } catch (error) {
      console.error("Erro ao buscar cidade:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Efeito principal para sincronizar com a URL
  useEffect(() => {
    const slug = getCitySlugFromUrl();

    if (slug) {
      fetchCityBySlug(slug).then((city) => {
        setCurrentCity(city);
      });
    } else {
      // Não há slug na URL, limpar cidade atual
      setCurrentCity(null);
      setLoading(false);
    }
  }, [pathname, params]);

  const value = {
    currentCity,
    loading,
    // Função utilitária para verificar se estamos em uma página de cidade
    isOnCityPage: () => !!getCitySlugFromUrl(),
    // Função para obter o slug atual
    getCurrentSlug: getCitySlugFromUrl,
    // Função para definir cidade manualmente (quando necessário)
    setCurrentCity: (city) => {
      setCurrentCity(city);
    },
  };

  return <CityContext.Provider value={value}>{children}</CityContext.Provider>;
}

export function useCity() {
  const context = useContext(CityContext);
  if (!context) {
    throw new Error("useCity deve ser usado dentro de um CityProvider");
  }
  return context;
}

// Hook específico para obter dados da cidade atual
export function useCurrentCity() {
  const { currentCity, loading } = useCity();
  return { currentCity, loading };
}

// Hook para navegação entre cidades
export function useCityNavigation() {
  const { getCurrentSlug } = useCity();

  const navigateToCity = (citySlug, section = "memorias") => {
    if (typeof window !== "undefined") {
      window.location.href = `/${section}/${citySlug}`;
    }
  };

  const navigateToCurrentCity = (section = "memorias") => {
    const currentSlug = getCurrentSlug();
    if (currentSlug) {
      navigateToCity(currentSlug, section);
    }
  };

  return {
    navigateToCity,
    navigateToCurrentCity,
    getCurrentSlug,
  };
}
