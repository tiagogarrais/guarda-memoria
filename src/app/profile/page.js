"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import InputMask from "react-input-mask";
import SiteHeader from "@/components/SiteHeader";

export default function Profile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    birthDate: "",
    cpf: "",
    whatsapp: "",
    whatsappCountryCode: "55", // Padrão Brasil
    whatsappConsent: false,
    bio: "",
    fotoPerfilUrl: "",
    cidadesFavoritas: [], // Agora será um array de objetos {stateId, cityId, stateName, cityName}
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState(""); // Mensagem de sucesso
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState({});
  const [cities, setCities] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  // Buscar lista de países e dados de estados/cidades
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch("/api/countries");
        if (res.ok) {
          const data = await res.json();
          setCountries(data.countries);
        }
      } catch (error) {
        console.error("Erro ao buscar países:", error);
      }
    };

    const fetchStatesAndCities = async () => {
      try {
        const res = await fetch("/estados-cidades2.json");
        if (res.ok) {
          const data = await res.json();
          setStates(data.states);
          setCities(data.cities);
        }
      } catch (error) {
        console.error("Erro ao buscar estados e cidades:", error);
      }
    };

    fetchCountries();
    fetchStatesAndCities();
  }, []);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) router.push("/");

    // Buscar dados do perfil via API
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          // Converter cidades favoritas - suportar ambos os formatos (strings antigas e objetos novos)
          let cidadesFavoritasArray = [];

          if (data.user.cidadesFavoritas) {
            if (Array.isArray(data.user.cidadesFavoritas)) {
              // Verificar se são objetos completos (formato novo) ou strings (formato antigo)
              cidadesFavoritasArray = data.user.cidadesFavoritas
                .map((item) => {
                  if (typeof item === "object" && item.cityId && item.stateId) {
                    // Formato novo - objeto completo
                    return item;
                  } else if (typeof item === "string") {
                    // Formato antigo - string, tentar converter
                    const cityData = cities.find(
                      (city) => city.name === item.trim()
                    );
                    if (cityData) {
                      return {
                        stateId: cityData.state_id,
                        cityId: cityData.id,
                        stateName: states[cityData.state_id.toString()],
                        cityName: cityData.name,
                      };
                    }
                    return null;
                  } else {
                    return null;
                  }
                })
                .filter(Boolean);
            }
          }

          setFormData({
            fullName: data.user.fullName || "", // Não usar nome da autenticação Google
            birthDate: data.user.birthDate || "",
            cpf: data.user.cpf || "",
            whatsapp: data.user.whatsapp || "",
            whatsappCountryCode: data.user.whatsappCountryCode || "55",
            whatsappConsent: data.user.whatsappConsent || false,
            bio: data.user.bio || "",
            fotoPerfilUrl: data.user.fotoPerfilUrl || "",
            cidadesFavoritas: cidadesFavoritasArray,
          });
        } else {
          // Se não conseguir buscar, usar dados da sessão como fallback
          const cidadesFavoritasArray = session.user.cidadesFavoritas
            ? session.user.cidadesFavoritas
                .map((cityName) => {
                  const cityData = cities.find(
                    (city) => city.name === cityName.trim()
                  );
                  if (cityData) {
                    return {
                      stateId: cityData.state_id,
                      cityId: cityData.id,
                      stateName: states[cityData.state_id.toString()],
                      cityName: cityData.name,
                    };
                  }
                  return null;
                })
                .filter(Boolean)
            : [];

          setFormData({
            fullName: "", // Campo vazio para entrada ativa do usuário
            birthDate: session.user.birthDate
              ? new Date(session.user.birthDate).toISOString().split("T")[0]
              : "",
            cpf: session.user.cpf || "",
            whatsapp: session.user.whatsapp || "",
            whatsappCountryCode: session.user.whatsappCountryCode || "55",
            whatsappConsent: session.user.whatsappConsent || false,
            bio: session.user.bio || "",
            fotoPerfilUrl: session.user.fotoPerfilUrl || "",
            cidadesFavoritas: cidadesFavoritasArray,
          });
        }
      } catch (error) {
        console.error("Erro ao buscar perfil:", error);
        // Fallback para dados da sessão
        const cidadesFavoritasArray = session.user.cidadesFavoritas
          ? session.user.cidadesFavoritas
              .map((cityName) => {
                const cityData = cities.find(
                  (city) => city.name === cityName.trim()
                );
                if (cityData) {
                  return {
                    stateId: cityData.state_id,
                    cityId: cityData.id,
                    stateName: states[cityData.state_id.toString()],
                    cityName: cityData.name,
                  };
                }
                return null;
              })
              .filter(Boolean)
          : [];

        setFormData({
          fullName: "", // Campo vazio para entrada ativa do usuário
          birthDate: session.user.birthDate
            ? new Date(session.user.birthDate).toISOString().split("T")[0]
            : "",
          cpf: session.user.cpf || "",
          whatsapp: session.user.whatsapp || "",
          whatsappConsent: session.user.whatsappConsent || false,
          bio: session.user.bio || "",
          fotoPerfilUrl: session.user.fotoPerfilUrl || "",
          cidadesFavoritas: cidadesFavoritasArray,
        });
      }
    };

    fetchProfile();
  }, [session, status, router]);

  // Funções para gerenciar cidades favoritas
  const addCidadeFavorita = () => {
    if (!selectedState || !selectedCity) return;

    const stateName = states[selectedState];
    const cityData = cities.find((city) => city.id.toString() === selectedCity);

    if (!cityData || !stateName) return;

    // Verificar se a cidade já foi adicionada
    const alreadyExists = formData.cidadesFavoritas.some(
      (cidade) => cidade.cityId === cityData.id
    );

    if (alreadyExists) {
      alert("Esta cidade já foi adicionada às favoritas!");
      return;
    }

    const newCidade = {
      stateId: parseInt(selectedState),
      cityId: cityData.id,
      stateName,
      cityName: cityData.name,
    };

    setFormData({
      ...formData,
      cidadesFavoritas: [...formData.cidadesFavoritas, newCidade],
    });

    // Limpar selects
    setSelectedState("");
    setSelectedCity("");
  };

  const removeCidadeFavorita = (cityId) => {
    setFormData({
      ...formData,
      cidadesFavoritas: formData.cidadesFavoritas.filter(
        (cidade) => cidade.cityId !== cityId
      ),
    });
  };

  // Filtrar cidades do estado selecionado
  const cidadesDoEstado = selectedState
    ? cities.filter((city) => city.state_id.toString() === selectedState)
    : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]); // Limpar erros anteriores
    setSuccessMessage(""); // Limpar mensagem de sucesso anterior

    // Preparar dados para envio - manter objetos completos das cidades favoritas
    const dataToSend = {
      ...formData,
      cidadesFavoritas: formData.cidadesFavoritas, // Enviar objetos completos {stateId, cityId, stateName, cityName}
    };

    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataToSend),
    });

    if (res.ok) {
      const data = await res.json();
      // Dados salvos com sucesso - mostrar mensagem
      setSuccessMessage("✅ Perfil salvo com sucesso!");
      setErrors([]); // Limpar erros anteriores

      // Aguardar um pouco antes de redirecionar para que o usuário veja a mensagem
      setTimeout(() => {
        router.push("/");
      }, 2000); // 2 segundos
    } else {
      try {
        const errorData = await res.json();
        if (errorData.errors && Array.isArray(errorData.errors)) {
          setErrors(errorData.errors);
        } else {
          setErrors(["Erro ao salvar perfil. Tente novamente."]);
        }
      } catch {
        setErrors(["Erro ao salvar perfil. Tente novamente."]);
      }
    }
    setLoading(false);
  };

  if (status === "loading") return <p>Carregando...</p>;

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "24px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Header Geral do Site */}
      <SiteHeader />

      <h1>Complete seu Perfil</h1>

      <div
        style={{
          marginBottom: 20,
          padding: 12,
          backgroundColor: "#f8f9fa",
          borderRadius: 4,
        }}
      >
        <label
          style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}
        >
          E-mail:
        </label>
        <input
          type="email"
          value={session?.user?.email || ""}
          readOnly
          style={{
            padding: 8,
            width: "100%",
            backgroundColor: "#e9ecef",
            border: "1px solid #ced4da",
            borderRadius: 4,
            color: "#6c757d",
          }}
        />
        <small style={{ color: "#6c757d", marginTop: 4, display: "block" }}>
          Este e-mail foi validado durante o login e não pode ser alterado.
        </small>
      </div>

      {/* Mensagem de Sucesso */}
      {successMessage && (
        <div
          style={{
            backgroundColor: "#d4edda",
            color: "#155724",
            padding: 12,
            borderRadius: 4,
            border: "1px solid #c3e6cb",
            marginBottom: 20,
          }}
        >
          {successMessage}
        </div>
      )}

      {errors.length > 0 && (
        <div
          style={{
            backgroundColor: "#f8d7da",
            color: "#721c24",
            padding: 12,
            borderRadius: 4,
            border: "1px solid #f5c6cb",
            marginBottom: 20,
          }}
        >
          <strong>Por favor, corrija os seguintes erros:</strong>
          <ul style={{ margin: "8px 0 0 20px", padding: 0 }}>
            {errors.map((error, index) => (
              <li key={index} style={{ marginBottom: 4 }}>
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 15 }}
      >
        <label>
          Nome Completo:
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) =>
              setFormData({ ...formData, fullName: e.target.value })
            }
            required
            style={{ padding: 8, width: "100%" }}
          />
        </label>
        <label>
          Data de Nascimento:
          <input
            type="date"
            value={formData.birthDate}
            onChange={(e) =>
              setFormData({ ...formData, birthDate: e.target.value })
            }
            required
            style={{ padding: 8, width: "100%" }}
          />
        </label>
        <label>
          CPF:
          <InputMask
            mask="999.999.999-99"
            value={formData.cpf}
            onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
            required
          >
            {(inputProps) => (
              <input
                {...inputProps}
                type="text"
                placeholder="000.000.000-00"
                style={{ padding: 8, width: "100%" }}
              />
            )}
          </InputMask>
        </label>
        <label>
          WhatsApp (opcional):
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <select
              value={formData.whatsappCountryCode}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  whatsappCountryCode: e.target.value,
                })
              }
              style={{ padding: 8, minWidth: 120 }}
            >
              {countries.map((country) => (
                <option key={country.ddi} value={country.ddi}>
                  +{country.ddi} {country.pais}
                </option>
              ))}
            </select>
            <InputMask
              mask={
                formData.whatsappCountryCode === "55"
                  ? "(99) 99999-9999"
                  : "999999999999999"
              }
              value={formData.whatsapp}
              onChange={(e) =>
                setFormData({ ...formData, whatsapp: e.target.value })
              }
            >
              {(inputProps) => (
                <input
                  {...inputProps}
                  type="tel"
                  placeholder={
                    formData.whatsappCountryCode === "55"
                      ? "(11) 99999-9999"
                      : "Número do telefone"
                  }
                  style={{ padding: 8, flex: 1 }}
                />
              )}
            </InputMask>
          </div>
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <input
            type="checkbox"
            checked={formData.whatsappConsent}
            onChange={(e) =>
              setFormData({ ...formData, whatsappConsent: e.target.checked })
            }
          />
          Concordo em receber comunicações via WhatsApp
        </label>

        <label>
          Bio (opcional):
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            rows={3}
            placeholder="Conte um pouco sobre você..."
            style={{ padding: 8, width: "100%" }}
          />
        </label>

        <label>
          URL da Foto de Perfil (opcional):
          <input
            type="url"
            value={formData.fotoPerfilUrl}
            onChange={(e) =>
              setFormData({ ...formData, fotoPerfilUrl: e.target.value })
            }
            placeholder="https://exemplo.com/foto.jpg"
            style={{ padding: 8, width: "100%" }}
          />
        </label>

        <label>
          Cidades Favoritas (opcional):
          <div style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
              <select
                value={selectedState}
                onChange={(e) => {
                  setSelectedState(e.target.value);
                  setSelectedCity(""); // Limpar cidade quando estado muda
                }}
                style={{ padding: 8, flex: 1 }}
              >
                <option value="">Selecione um estado</option>
                {Object.entries(states).map(([id, name]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>

              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                disabled={!selectedState}
                style={{ padding: 8, flex: 1 }}
              >
                <option value="">
                  {selectedState
                    ? "Selecione uma cidade"
                    : "Selecione um estado primeiro"}
                </option>
                {cidadesDoEstado.map((city) => (
                  <option key={city.id} value={city.id.toString()}>
                    {city.name}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={addCidadeFavorita}
                disabled={!selectedState || !selectedCity}
                style={{
                  padding: "8px 16px",
                  backgroundColor:
                    !selectedState || !selectedCity ? "#ccc" : "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: 4,
                  cursor:
                    !selectedState || !selectedCity ? "not-allowed" : "pointer",
                }}
              >
                Adicionar
              </button>
            </div>

            {formData.cidadesFavoritas.length > 0 && (
              <div>
                <p style={{ marginBottom: 8, fontWeight: "bold" }}>
                  Cidades selecionadas:
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {formData.cidadesFavoritas.map((cidade) => (
                    <div
                      key={cidade.cityId}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "4px 8px",
                        backgroundColor: "#f8f9fa",
                        border: "1px solid #dee2e6",
                        borderRadius: 4,
                      }}
                    >
                      <span>
                        {cidade.cityName} - {cidade.stateName}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeCidadeFavorita(cidade.cityId)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#dc3545",
                          cursor: "pointer",
                          fontSize: "16px",
                          padding: 0,
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </label>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: 12,
            backgroundColor: loading ? "#ccc" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Salvando..." : "Salvar Perfil"}
        </button>
      </form>

      {/* Seção de Histórico */}
      <section style={{ marginTop: 40 }}>
        <h2>Seu Histórico de Contribuições</h2>
        <p>
          Em desenvolvimento: Aqui aparecerá uma lista de pessoas que você
          indicou, comentários feitos, etc.
        </p>
      </section>
    </div>
  );
}
