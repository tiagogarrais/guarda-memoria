import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const formData = await request.formData();
  const cityId = parseInt(formData.get("cityId"));

  if (!cityId || isNaN(cityId)) {
    return new Response("Invalid city ID", { status: 400 });
  }

  try {
    // Verificar se o usuário tem esta cidade como favorita
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        favoriteCities: {
          where: { id: cityId },
        },
      },
    });

    if (!user) {
      return new Response("User not found", { status: 404 });
    }

    if (user.favoriteCities.length === 0) {
      return new Response("City not in favorites", { status: 400 });
    }

    // Remover cidade dos favoritos
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        favoriteCities: {
          disconnect: { id: cityId },
        },
      },
    });

    // Retornar resposta de sucesso - o frontend fará o redirecionamento
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error removing favorite city:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
