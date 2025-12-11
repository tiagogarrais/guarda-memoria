import { getServerSession } from "next-auth";
import { authOptions } from "../../auth";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import CityFeedSection from "../../components/CityFeedSection";

const prisma = new PrismaClient();

export default async function CityPage({ params }) {
  const session = await getServerSession(authOptions);
  const { cityId: cityIdParam } = await params;
  const cityId = parseInt(cityIdParam);

  if (isNaN(cityId)) {
    return <div>ID da cidade inválido</div>;
  }

  if (!session) {
    redirect("/api/auth/signin");
  }

  // Verificar se o usuário tem localização definida
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { stateId: true, cityId: true },
  });

  if (!user?.stateId || !user?.cityId) {
    redirect("/select-location");
  }

  // Buscar nome da cidade
  const cityData = await prisma.city.findUnique({
    where: { id: cityId },
    select: { id: true, name: true, state: { select: { sigla: true } } },
  });

  if (!cityData) {
    return <div>Cidade não encontrada</div>;
  }

  return (
    <>
      {/* Header fixo */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-4">
            <h1 className="text-xl font-bold text-gray-900">Guarda Memória</h1>
          </div>
        </div>
      </header>

      <main className="flex min-h-screen flex-col items-center p-6">
        <div className="z-10 max-w-5xl w-full font-mono text-sm mb-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold">Memórias de</h1>
            <h1 className="text-3xl font-bold">
              {cityData.name} - {cityData.state.sigla.toUpperCase()}
            </h1>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <p>Olá, {session.user?.name}</p>
              <Link
                href="/api/auth/signout"
                className="bg-red-500 text-white px-3 py-1 text-sm rounded"
              >
                Sair
              </Link>
            </div>
            <div className="flex items-center">
              <Link
                href="/"
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Minhas memórias
              </Link>
            </div>
          </div>
        </div>

        <div className="w-full max-w-4xl">
          <CityFeedSection
            cityId={cityId}
            cityName={cityData.name}
            stateSigla={cityData.state.sigla}
          />
        </div>
      </main>
    </>
  );
}
