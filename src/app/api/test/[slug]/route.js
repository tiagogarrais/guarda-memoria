import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { slug } = params;

    return NextResponse.json({
      success: true,
      slug: slug,
      message: "Endpoint funcionando",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erro:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
