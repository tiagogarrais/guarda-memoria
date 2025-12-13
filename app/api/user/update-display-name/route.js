import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const displayName = formData.get("displayName")?.toString().trim();

    // Validar o displayName
    if (!displayName) {
      return NextResponse.json(
        { error: "Nome de exibição não pode estar vazio" },
        { status: 400 }
      );
    }

    if (displayName.length > 50) {
      return NextResponse.json(
        { error: "Nome de exibição deve ter no máximo 50 caracteres" },
        { status: 400 }
      );
    }

    // Atualizar o displayName do usuário
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: { displayName },
      select: { id: true, displayName: true },
    });

    return NextResponse.json({
      success: true,
      displayName: updatedUser.displayName,
    });
  } catch (error) {
    console.error("Erro ao atualizar displayName:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
