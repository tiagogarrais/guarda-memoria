import { NextResponse } from "next/server";

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Só rastrear páginas públicas, não APIs ou admin
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Registrar visita via API
  try {
    const visitData = {
      path: pathname,
      source: request.nextUrl.searchParams.get("source") || null,
      userAgent: request.headers.get("user-agent") || null,
      ip: request.ip || request.headers.get("x-forwarded-for") || null,
    };

    // Fazer chamada para a API de visita em background
    fetch(`${request.nextUrl.origin}/api/visit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(visitData),
    }).catch((error) => {
      console.error("Erro ao chamar API de visita:", error);
    });
  } catch (error) {
    console.error("Erro no middleware:", error);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
