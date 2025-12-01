"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useCurrentCity, useCityNavigation } from "@/contexts/CityContext";

export default function NavigationBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { currentCity, loading: cityLoading } = useCurrentCity();
  const { navigateToCurrentCity } = useCityNavigation();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Verificar tamanho da tela
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  if (!currentCity && !cityLoading) return null;
  if (cityLoading)
    return (
      <div style={{ padding: "1rem", textAlign: "center", color: "#666" }}>
        Carregando...
      </div>
    );

  const baseSlug = currentCity.slug || `cidade-${currentCity.id}`;

  const navItems = [
    {
      href: `/memorias/${baseSlug}`,
      label: "🏛️ Memórias",
      description: "Explorar memórias",
    },
    {
      href: `/pessoas`,
      label: "👥 Pessoas",
      description: "Ver pessoas",
    },
    {
      href: `/indicar-memoria`,
      label: "➕ Indicar Memória",
      description: "Adicionar memória",
    },
    {
      href: `/indicar-pessoa`,
      label: "👤 Indicar Pessoa",
      description: "Adicionar pessoa",
    },
  ];

  const isActive = (href) => {
    if (href.includes("/memorias/")) {
      return pathname.includes("/memorias/");
    }
    return pathname.startsWith(href);
  };

  return (
    <nav
      style={{
        background: "white",
        borderBottom: "1px solid #e0e0e0",
        marginBottom: "2rem",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 1rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: isMobile ? "0.5rem" : "1rem",
            padding: "1rem 0",
            overflowX: "auto",
            whiteSpace: "nowrap",
          }}
        >
          {navItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem 1rem",
                borderRadius: "8px",
                textDecoration: "none",
                color: isActive(item.href) ? "#667eea" : "#666",
                background: isActive(item.href) ? "#f0f2ff" : "transparent",
                border: isActive(item.href)
                  ? "1px solid #667eea"
                  : "1px solid transparent",
                fontSize: isMobile ? "0.85rem" : "0.9rem",
                fontWeight: isActive(item.href) ? "600" : "normal",
                transition: "all 0.3s",
                flexShrink: 0,
                minWidth: "fit-content",
              }}
              onMouseOver={(e) => {
                if (!isActive(item.href)) {
                  e.target.style.background = "#f8f9fa";
                  e.target.style.color = "#333";
                }
              }}
              onMouseOut={(e) => {
                if (!isActive(item.href)) {
                  e.target.style.background = "transparent";
                  e.target.style.color = "#666";
                }
              }}
            >
              <span>{item.label}</span>
              {!isMobile && (
                <span
                  style={{
                    fontSize: "0.8rem",
                    opacity: 0.7,
                    display: "none",
                  }}
                >
                  {item.description}
                </span>
              )}
            </Link>
          ))}
        </div>

        {/* Breadcrumb para contexto */}
        <div
          style={{
            fontSize: "0.85rem",
            color: "#888",
            paddingBottom: "1rem",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <span>📍 Navegando em: </span>
          <strong style={{ color: "#667eea" }}>
            {currentCity.nome} - {currentCity.estado.toUpperCase()}
          </strong>
        </div>
      </div>
    </nav>
  );
}
