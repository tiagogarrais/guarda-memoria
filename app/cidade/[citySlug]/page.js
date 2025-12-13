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

      <main className="flex min-h-screen flex-col items-center p-6">
        <div className="z-10 max-w-5xl w-full font-mono text-sm mb-8">
          <div className="text-center mb-6">
            <h1 className={`text-3xl font-bold ${pacifico.className}`}>
              Memórias de
            </h1>
            <h1 className={`text-3xl ${pacifico.className}`}>
              {cityData.name} - {cityData.state.sigla.toUpperCase()}
            </h1>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0">
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
            cityId={cityData.id}
            cityName={cityData.name}
            stateSigla={cityData.state.sigla}
          />
        </div>
      </main>
    </>
  );
}
