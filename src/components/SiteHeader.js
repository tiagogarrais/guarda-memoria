"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useCurrentCity, useCityNavigation } from "@/contexts/CityContext";

export default function SiteHeader() {
  const { data: session } = useSession();
  const router = useRouter();
  const { currentCity, loading: cityLoading } = useCurrentCity();
  const { navigateToCity } = useCityNavigation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCityMenu, setShowCityMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [cidades, setCidades] = useState([]);
  const menuRef = useRef(null);
  const cityMenuRef = useRef(null);

  useEffect(() => {
    // Verificar tamanho da tela
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    // Carregar lista de cidades para o dropdown
    fetchCidades();

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  // Carregar lista de cidades
  const fetchCidades = async () => {
    try {
      const response = await fetch("/api/countries");
      if (response.ok) {
        const data = await response.json();
        // A API retorna { success: true, countries: [...] }
        if (data.success && Array.isArray(data.countries)) {
          setCidades(data.countries);
        } else {
          console.error("Formato de resposta inesperado:", data);
          setCidades([]);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar cidades:", error);
      setCidades([]);
    }
  };

  // Fechar menus quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (cityMenuRef.current && !cityMenuRef.current.contains(event.target)) {
        setShowCityMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleTrocarCidade = () => {
    setShowUserMenu(false);
    router.push("/selecionar-localizacao");
  };

  const handleSelectCity = (cidade) => {
    setShowCityMenu(false);
    navigateToCity(cidade.slug, "memorias");
  };

  const handleLogout = async () => {
    setShowUserMenu(false);
    try {
      await signOut({ callbackUrl: "/" });
    } catch (error) {
      console.error("Erro no logout:", error);
    }
  };

  return (
    <header
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        padding: "1rem 0",
        marginBottom: "2rem",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 1rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        {/* Logo e título */}
        <div
          style={{
            textAlign: isMobile ? "center" : "left",
            flex: "1 1 300px",
            minWidth: isMobile ? "100%" : "auto",
          }}
        >
          <Link href="/" style={{ textDecoration: "none", color: "white" }}>
            <h1
              style={{
                fontSize: isMobile ? "2rem" : "2.5rem",
                margin: "0",
                fontWeight: "bold",
              }}
            >
              Guarda Memória
            </h1>
          </Link>
          <p
            style={{
              fontSize: isMobile ? "0.9rem" : "1rem",
              margin: "0.5rem 0 0 0",
              opacity: 0.9,
              fontWeight: "300",
            }}
          >
            Preservando histórias que marcaram nossas cidades
          </p>
        </div>

        {/* Área do usuário e cidade */}
        {session && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              flexWrap: "wrap",
              justifyContent: isMobile ? "center" : "flex-end",
              width: isMobile ? "100%" : "auto",
            }}
          >
            {/* Informações da cidade atual */}
            {currentCity && (
              <div
                style={{
                  background: "rgba(255,255,255,0.2)",
                  padding: "0.5rem 1rem",
                  borderRadius: "20px",
                  fontSize: "0.9rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  maxWidth: "100%",
                  overflow: "hidden",
                  cursor: "pointer",
                }}
                onClick={() => setShowCityMenu(!showCityMenu)}
                ref={cityMenuRef}
              >
                <span
                  style={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  📍 {currentCity.nome} - {currentCity.estado.toUpperCase()}
                </span>
                <span style={{ flexShrink: 0, fontSize: "0.7rem" }}>▼</span>

                {/* Dropdown de cidades */}
                {showCityMenu && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      right: "0",
                      background: "white",
                      color: "black",
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                      zIndex: 1000,
                      minWidth: "200px",
                      maxHeight: "300px",
                      overflowY: "auto",
                      marginTop: "0.5rem",
                    }}
                  >
                    {Array.isArray(cidades) && cidades.length > 0 ? (
                      cidades.map((cidade) => (
                        <button
                          key={cidade.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectCity(cidade);
                          }}
                          style={{
                            width: "100%",
                            padding: "0.75rem 1rem",
                            background:
                              cidade.id === currentCity?.id
                                ? "#f0f8ff"
                                : "white",
                            border: "none",
                            textAlign: "left",
                            cursor: "pointer",
                            borderBottom: "1px solid #eee",
                            color:
                              cidade.id === currentCity?.id
                                ? "#007bff"
                                : "black",
                            transition: "background 0.2s",
                          }}
                          onMouseOver={(e) =>
                            (e.target.style.background = "#f8f9fa")
                          }
                          onMouseOut={(e) =>
                            (e.target.style.background =
                              cidade.id === currentCity?.id
                                ? "#f0f8ff"
                                : "white")
                          }
                        >
                          📍 {cidade.nome} - {cidade.estado?.toUpperCase()}
                        </button>
                      ))
                    ) : (
                      <div
                        style={{
                          padding: "1rem",
                          color: "#666",
                          textAlign: "center",
                        }}
                      >
                        Carregando cidades...
                      </div>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTrocarCidade();
                      }}
                      style={{
                        width: "100%",
                        padding: "0.75rem 1rem",
                        background: "#f8f9fa",
                        border: "none",
                        textAlign: "left",
                        cursor: "pointer",
                        color: "#6c757d",
                        fontStyle: "italic",
                      }}
                    >
                      + Selecionar outra cidade
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Menu do usuário */}
            <div ref={menuRef} style={{ position: "relative" }}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  border: "none",
                  color: "white",
                  padding: "0.5rem 1rem",
                  borderRadius: "20px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontSize: "0.9rem",
                  transition: "background 0.3s",
                  maxWidth: "200px",
                }}
                onMouseOver={(e) =>
                  (e.target.style.background = "rgba(255,255,255,0.3)")
                }
                onMouseOut={(e) =>
                  (e.target.style.background = "rgba(255,255,255,0.2)")
                }
              >
                {session.user?.image ? (
                  <img
                    src={session.user.image}
                    alt="Avatar"
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <span>👤</span>
                )}
                <span
                  style={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {session.user?.name || "Usuário"}
                </span>
                <span
                  style={{
                    transform: showUserMenu ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.3s",
                    flexShrink: 0,
                  }}
                >
                  ▼
                </span>
              </button>

              {/* Dropdown do usuário */}
              {showUserMenu && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    right: "0",
                    background: "white",
                    color: "#333",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    minWidth: "200px",
                    zIndex: 1000,
                    marginTop: "0.5rem",
                  }}
                >
                  <Link
                    href="/profile"
                    style={{
                      display: "block",
                      padding: "0.75rem 1rem",
                      textDecoration: "none",
                      color: "#333",
                      borderBottom: "1px solid #eee",
                    }}
                    onMouseOver={(e) => (e.target.style.background = "#f8f9fa")}
                    onMouseOut={(e) =>
                      (e.target.style.background = "transparent")
                    }
                  >
                    👤 Meu Perfil
                  </Link>

                  {!currentCity && (
                    <button
                      onClick={handleTrocarCidade}
                      style={{
                        width: "100%",
                        padding: "0.75rem 1rem",
                        border: "none",
                        background: "transparent",
                        textAlign: "left",
                        cursor: "pointer",
                        borderBottom: "1px solid #eee",
                      }}
                      onMouseOver={(e) =>
                        (e.target.style.background = "#f8f9fa")
                      }
                      onMouseOut={(e) =>
                        (e.target.style.background = "transparent")
                      }
                    >
                      📍 Selecionar Cidade
                    </button>
                  )}

                  <button
                    onClick={handleLogout}
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      border: "none",
                      background: "transparent",
                      textAlign: "left",
                      cursor: "pointer",
                      color: "#dc3545",
                    }}
                    onMouseOver={(e) => (e.target.style.background = "#f8f9fa")}
                    onMouseOut={(e) =>
                      (e.target.style.background = "transparent")
                    }
                  >
                    🚪 Sair
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
