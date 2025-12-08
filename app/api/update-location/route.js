import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { stateId, cityId } = await request.json();

    if (!stateId || !cityId) {
      return Response.json(
        { error: "Estado e cidade são obrigatórios" },
        { status: 400 }
      );
    }

    // Atualizar localização do usuário
    await prisma.user.update({
      where: { email: session.user.email },
      data: { stateId, cityId },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Erro ao atualizar localização:", error);
    return Response.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
