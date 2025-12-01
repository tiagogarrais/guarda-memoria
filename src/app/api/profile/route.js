import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Função simples para validar CPF
function isValidCPF(cpf) {
  try {
    console.log("🆔 Validating CPF input:", cpf);

    if (!cpf) {
      console.log("❌ CPF is null/undefined");
      return false;
    }

    // Remove caracteres não numéricos
    cpf = cpf.toString().replace(/[^\d]/g, "");
    console.log("🆔 CPF after cleaning:", cpf);

    // Verifica se tem 11 dígitos
    if (cpf.length !== 11) {
      console.log("❌ CPF length invalid:", cpf.length);
      return false;
    }

    // Verifica se todos os dígitos são iguais (CPF inválido)
    if (/^(\d)\1+$/.test(cpf)) {
      console.log("❌ CPF has all same digits");
      return false;
    }

    // Calcula primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(9))) {
      console.log("❌ First verification digit invalid");
      return false;
    }

    // Calcula segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(10))) {
      console.log("❌ Second verification digit invalid");
      return false;
    }

    console.log("✅ CPF is valid");
    return true;
  } catch (error) {
    console.error("💥 Error validating CPF:", error);
    return false;
  }
}

export async function PUT(request) {
  const session = await getServerSession(authOptions);
  console.log("🔍 PUT /api/profile - Session:", session?.user?.email);

  if (!session) {
    console.log("❌ No session found");
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const requestData = await request.json();
    console.log("📥 Request data received:", requestData);

    const {
      fullName,
      birthDate,
      cpf: cpfValue,
      whatsapp,
      whatsappCountryCode,
      whatsappConsent,
      bio,
      fotoPerfilUrl,
      cidadesFavoritas,
    } = requestData;

    console.log("📋 Extracted data:", {
      fullName,
      birthDate,
      cpfValue,
      whatsapp,
      whatsappCountryCode,
      whatsappConsent,
      bio,
      fotoPerfilUrl,
      cidadesFavoritas,
    });

    const errors = [];

    let birthDateObj = null;
    console.log("🔍 Starting validation...");

    if (!fullName || fullName.trim().length < 2) {
      console.log("❌ Invalid fullName:", fullName);
      errors.push(
        "Nome completo é obrigatório e deve ter pelo menos 2 caracteres"
      );
    }

    if (!birthDate) {
      console.log("❌ Missing birthDate");
      errors.push("Data de nascimento é obrigatória");
    } else {
      console.log("🗓️ Processing birthDate:", birthDate);
      birthDateObj = new Date(birthDate);
      console.log("🗓️ Parsed birthDate:", birthDateObj);

      if (isNaN(birthDateObj.getTime())) {
        console.log("❌ Invalid date format");
        errors.push("Data de nascimento inválida");
      } else {
        const today = new Date();
        const age = today.getFullYear() - birthDateObj.getFullYear();
        console.log("👶 Calculated age:", age);

        if (age < 18 || age > 120) {
          console.log("❌ Invalid age:", age);
          errors.push(
            "Data de nascimento inválida (idade deve ser entre 18 e 120 anos)"
          );
        }
      }
    }

    if (!cpfValue) {
      console.log("❌ Missing CPF");
      errors.push("CPF é obrigatório");
    } else {
      console.log("🆔 Validating CPF:", cpfValue);
      const isValidCpf = isValidCPF(cpfValue);
      console.log("🆔 CPF validation result:", isValidCpf);

      if (!isValidCpf) {
        console.log("❌ Invalid CPF:", cpfValue);
        errors.push(
          "CPF inválido. Verifique se todos os dígitos estão corretos"
        );
      }
    }

    // Se houver erros, retornar todos de uma vez
    if (errors.length > 0) {
      console.log("❌ Validation errors:", errors);
      return new Response(
        JSON.stringify({
          success: false,
          errors: errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.log("✅ Validation passed, finding user...");

    // Primeiro, garantir que existe um usuário na tabela User
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    console.log("👤 User found:", user ? "Yes" : "No", user?.id);

    if (!user) {
      console.log("❌ User not found in database");
      return new Response("Usuário não encontrado", { status: 404 });
    }

    console.log(
      "🔄 DEBUG - cidadesFavoritas before processing:",
      cidadesFavoritas
    );

    const upsertData = {};

    if (fullName !== undefined && fullName !== null)
      upsertData.fullName = fullName;
    if (birthDateObj) upsertData.birthDate = birthDateObj;
    if (cpfValue !== undefined && cpfValue !== null) upsertData.cpf = cpfValue;
    if (whatsapp !== undefined && whatsapp !== null)
      upsertData.whatsapp = whatsapp;
    if (whatsappCountryCode !== undefined && whatsappCountryCode !== null)
      upsertData.whatsappCountryCode = whatsappCountryCode;
    if (whatsappConsent !== undefined && whatsappConsent !== null)
      upsertData.whatsappConsent = whatsappConsent;
    if (bio !== undefined && bio !== null) upsertData.bio = bio;
    if (fotoPerfilUrl !== undefined && fotoPerfilUrl !== null)
      upsertData.fotoPerfilUrl = fotoPerfilUrl;

    // Processar cidadesFavoritas - converter array para string JSON
    console.log(
      "🏙️ Processing cidadesFavoritas ALWAYS:",
      cidadesFavoritas,
      typeof cidadesFavoritas
    );

    if (cidadesFavoritas !== undefined && cidadesFavoritas !== null) {
      console.log(
        "🏙️ Inside condition - cidadesFavoritas:",
        cidadesFavoritas,
        typeof cidadesFavoritas
      );

      if (typeof cidadesFavoritas === "string") {
        // Se já é string, manter como está
        upsertData.cidadesFavoritas = cidadesFavoritas;
        console.log("🏙️ Kept as string:", upsertData.cidadesFavoritas);
      } else if (Array.isArray(cidadesFavoritas)) {
        // Se é array, converter para string JSON
        upsertData.cidadesFavoritas = JSON.stringify(cidadesFavoritas);
        console.log(
          "🏙️ Converted array to JSON string:",
          upsertData.cidadesFavoritas
        );
      }
    } else {
      console.log("🏙️ cidadesFavoritas is undefined or null");
    }

    console.log("Dados para upsert (antes do processamento):", upsertData);

    // SEMPRE converter cidadesFavoritas para string se for array
    if (
      upsertData.cidadesFavoritas &&
      Array.isArray(upsertData.cidadesFavoritas)
    ) {
      console.log("🔄 Converting cidadesFavoritas array to JSON string");
      upsertData.cidadesFavoritas = JSON.stringify(upsertData.cidadesFavoritas);
    }

    console.log("Dados para upsert (filtrados):", upsertData);

    // Atualizar ou criar perfil na tabela Usuario
    const updatedProfile = await prisma.usuario.upsert({
      where: { userId: user.id },
      update: upsertData,
      create: {
        userId: user.id,
        ...upsertData,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          fullName: updatedProfile.fullName,
          birthDate: updatedProfile.birthDate,
          cpf: updatedProfile.cpf,
          whatsapp: updatedProfile.whatsapp,
          whatsappCountryCode: updatedProfile.whatsappCountryCode,
          whatsappConsent: updatedProfile.whatsappConsent,
          bio: updatedProfile.bio,
          fotoPerfilUrl: updatedProfile.fotoPerfilUrl,
          cidadesFavoritas: updatedProfile.cidadesFavoritas,
        },
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("💥 Error details:", {
      message: error.message,
      stack: error.stack,
      code: error.code,
      meta: error.meta,
    });

    // Se for erro do Prisma, retornar detalhes mais específicos
    if (error.code) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Database error: ${error.message}`,
          code: error.code,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: "Erro ao atualizar perfil",
        details: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });

  try {
    // Primeiro, encontrar o usuário na tabela User
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return new Response("Usuário não encontrado", { status: 404 });
    }

    // Buscar perfil na tabela Usuario
    const profile = await prisma.usuario.findUnique({
      where: { userId: user.id },
    });

    return new Response(
      JSON.stringify({
        success: true,
        id: profile?.id || user.id, // Retornar o ID do perfil ou do usuário
        user: {
          fullName: profile?.fullName || "",
          birthDate: profile?.birthDate
            ? profile.birthDate.toISOString().split("T")[0]
            : "",
          cpf: profile?.cpf || "",
          whatsapp: profile?.whatsapp || "",
          whatsappCountryCode: profile?.whatsappCountryCode || "55",
          whatsappConsent: profile?.whatsappConsent || false,
          bio: profile?.bio || "",
          fotoPerfilUrl: profile?.fotoPerfilUrl || "",
          cidadesFavoritas: profile?.cidadesFavoritas
            ? (function () {
                try {
                  return JSON.parse(profile.cidadesFavoritas);
                } catch (e) {
                  return [];
                }
              })()
            : [],
        },
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
    return new Response("Erro ao buscar perfil", { status: 500 });
  }
}
