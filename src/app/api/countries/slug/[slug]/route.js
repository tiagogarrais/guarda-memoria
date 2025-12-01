import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const { slug } = params;

    const cidade = await prisma.cidade.findUnique({
      where: {
        slug: slug,
      },
    });

    if (!cidade) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Cidade não encontrada",
        }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        cidade: cidade,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Erro ao buscar cidade:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Erro interno do servidor",
      }),
      { status: 500 }
    );
  }
}
