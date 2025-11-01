import fs from "fs";
import path from "path";

export async function GET(request) {
  try {
    // Ler o arquivo paises.json
    const filePath = path.join(process.cwd(), "paises.json");
    const fileContents = fs.readFileSync(filePath, "utf8");
    const countries = JSON.parse(fileContents);

    // Converter o objeto em array e ordenar por nome do país
    const countriesArray = Object.values(countries).sort((a, b) =>
      a.pais.localeCompare(b.pais)
    );

    return new Response(
      JSON.stringify({
        success: true,
        countries: countriesArray,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=86400", // Cache por 24 horas
        },
      }
    );
  } catch (error) {
    console.error("Erro ao buscar países:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Erro ao buscar lista de países",
      }),
      { status: 500 }
    );
  }
}
