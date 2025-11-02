"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import InputMask from "react-input-mask";

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
    cidadesFavoritas: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [countries, setCountries] = useState([]);

  // Buscar lista de países
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
    fetchCountries();
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
          setFormData({
            fullName: data.user.fullName || session.user.name || "",
            birthDate: data.user.birthDate || "",
            cpf: data.user.cpf || "",
            whatsapp: data.user.whatsapp || "",
            whatsappCountryCode: data.user.whatsappCountryCode || "55",
            whatsappConsent: data.user.whatsappConsent || false,
            bio: data.user.bio || "",
            fotoPerfilUrl: data.user.fotoPerfilUrl || "",
            cidadesFavoritas: data.user.cidadesFavoritas
              ? data.user.cidadesFavoritas.join(", ")
              : "",
          });
        } else {
          // Se não conseguir buscar, usar dados da sessão como fallback
          setFormData({
            fullName: session.user.fullName || session.user.name || "",
            birthDate: session.user.birthDate
              ? new Date(session.user.birthDate).toISOString().split("T")[0]
              : "",
            cpf: session.user.cpf || "",
            whatsapp: session.user.whatsapp || "",
            whatsappCountryCode: session.user.whatsappCountryCode || "55",
            whatsappConsent: session.user.whatsappConsent || false,
            bio: session.user.bio || "",
            fotoPerfilUrl: session.user.fotoPerfilUrl || "",
            cidadesFavoritas: session.user.cidadesFavoritas
              ? session.user.cidadesFavoritas.join(", ")
              : "",
          });
        }
      } catch (error) {
        console.error("Erro ao buscar perfil:", error);
        // Fallback para dados da sessão
        setFormData({
          fullName: session.user.fullName || session.user.name || "",
          birthDate: session.user.birthDate
            ? new Date(session.user.birthDate).toISOString().split("T")[0]
            : "",
          cpf: session.user.cpf || "",
          whatsapp: session.user.whatsapp || "",
          whatsappConsent: session.user.whatsappConsent || false,
          bio: session.user.bio || "",
          fotoPerfilUrl: session.user.fotoPerfilUrl || "",
          cidadesFavoritas: session.user.cidadesFavoritas
            ? session.user.cidadesFavoritas.join(", ")
            : "",
        });
      }
    };

    fetchProfile();
  }, [session, status, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]); // Limpar erros anteriores

    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      const data = await res.json();
      // Dados salvos com sucesso - redirecionar para página inicial
      router.push("/");
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
          Cidades Favoritas (separadas por vírgula, opcional):
          <input
            type="text"
            value={formData.cidadesFavoritas}
            onChange={(e) =>
              setFormData({ ...formData, cidadesFavoritas: e.target.value })
            }
            placeholder="São Paulo, Rio de Janeiro"
            style={{ padding: 8, width: "100%" }}
          />
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
