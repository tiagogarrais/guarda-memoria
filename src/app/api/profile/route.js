import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Função simples para validar CPF
function isValidCPF(cpf) {
  // Remove caracteres não numéricos
  cpf = cpf.replace(/[^\d]/g, "");

  // Verifica se tem 11 dígitos
  if (cpf.length !== 11) return false;

  // Verifica se todos os dígitos são iguais (CPF inválido)
  if (/^(\d)\1+$/.test(cpf)) return false;

  // Calcula primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(cpf.charAt(9))) return false;

  // Calcula segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(cpf.charAt(10))) return false;

  return true;
}

export async function PUT(request) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });

  const {
    fullName,
    birthDate,
    cpf: cpfValue,
    whatsapp,
    whatsappCountryCode,
    whatsappConsent,
  } = await request.json();

  // Validações detalhadas
  const errors = [];

  if (!fullName || fullName.trim().length < 2) {
    errors.push(
      "Nome completo é obrigatório e deve ter pelo menos 2 caracteres"
    );
  }

  if (!birthDate) {
    errors.push("Data de nascimento é obrigatória");
  } else {
    const birthDateObj = new Date(birthDate);
    const today = new Date();
    const age = today.getFullYear() - birthDateObj.getFullYear();
    if (age < 18 || age > 120) {
      errors.push(
        "Data de nascimento inválida (idade deve ser entre 18 e 120 anos)"
      );
    }
  }

  if (!cpfValue) {
    errors.push("CPF é obrigatório");
  } else if (!isValidCPF(cpfValue)) {
    errors.push("CPF inválido. Verifique se todos os dígitos estão corretos");
  }

  // Se houver erros, retornar todos de uma vez
  if (errors.length > 0) {
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

  try {
    // Primeiro, garantir que existe um usuário na tabela User
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return new Response("Usuário não encontrado", { status: 404 });
    }

    // Atualizar ou criar perfil na tabela Usuario
    const updatedProfile = await prisma.usuario.upsert({
      where: { userId: user.id },
      update: {
        fullName,
        birthDate: new Date(birthDate),
        cpf: cpfValue,
        whatsapp,
        whatsappCountryCode,
        whatsappConsent,
      },
      create: {
        userId: user.id,
        fullName,
        birthDate: new Date(birthDate),
        cpf: cpfValue,
        whatsapp,
        whatsappCountryCode,
        whatsappConsent,
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
        },
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    return new Response("Erro ao atualizar perfil", { status: 500 });
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
        user: {
          fullName: profile?.fullName || "",
          birthDate: profile?.birthDate
            ? profile.birthDate.toISOString().split("T")[0]
            : "",
          cpf: profile?.cpf || "",
          whatsapp: profile?.whatsapp || "",
          whatsappCountryCode: profile?.whatsappCountryCode || "55",
          whatsappConsent: profile?.whatsappConsent || false,
        },
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
    return new Response("Erro ao buscar perfil", { status: 500 });
  }
}
