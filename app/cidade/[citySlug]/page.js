import { getServerSession } from "next-auth";
import { authOptions } from "../../auth";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import { Pacifico } from "next/font/google";
import CityFeedSection from "../../components/CityFeedSection";
import Header from "../../components/Header";

const prisma = new PrismaClient();

const pacifico = Pacifico({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

export default async function CityPage({ params }) {
  const session = await getServerSession(authOptions);
  const { citySlug } = await params;

  if (!session) {
    redirect("/api/auth/signin");
  }

  // Verificar se o usuário tem localização definida
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      name: true,
      displayName: true,
      stateId: true,
      cityId: true,
    },
  });

  if (!user?.stateId || !user?.cityId) {
    redirect("/select-location");
  }

  // Buscar nome da cidade
  const cityData = await prisma.city.findUnique({
    where: { slug: citySlug },
    select: {
      id: true,
      name: true,
      slug: true,
      state: { select: { sigla: true } },
    },
  });

  if (!cityData) {
    return <div>Cidade não encontrada</div>;
  }

  return (
    <>
      <Header showUserInfo={true} session={session} user={user} />

      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Header da Cidade */}
          <div className="text-center mb-8">
            <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 ${pacifico.className}`}>
              Memórias de
            </h1>
            <h1 className={`text-2xl sm:text-3xl lg:text-4xl text-gray-700 ${pacifico.className}`}>
              {cityData.name} - {cityData.state.sigla.toUpperCase()}
            </h1>
            
          </div>

          {/* Feed da Cidade */}
          <div className="max-w-4xl mx-auto">
            <CityFeedSection
              cityId={cityData.id}
              cityName={cityData.name}
              stateSigla={cityData.state.sigla}
            />
          </div>
        </div>
      </main>
    </>
  );
}
