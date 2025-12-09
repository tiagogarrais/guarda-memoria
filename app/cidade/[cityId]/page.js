import { getServerSession } from "next-auth";
import { authOptions } from "../../auth";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import CityFeedSection from "../../components/CityFeedSection";

const prisma = new PrismaClient();

export default async function CityPage({ params }) {
  const session = await getServerSession(authOptions);
  const cityId = parseInt(params.cityId);

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
    select: { id: true, name: true },
  });

  if (!cityData) {
    return <div>Cidade não encontrada</div>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-6">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Feed de {cityData.name}</h1>
          <div className="flex items-center space-x-4">
            <p>Olá, {session.user?.name}</p>
            <Link href="/" className="bg-blue-500 text-white px-4 py-2 rounded">
              Meu Feed
            </Link>
            <Link
              href="/api/auth/signout"
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Sair
            </Link>
          </div>
        </div>
      </div>

      <div className="w-full max-w-4xl">
        <CityFeedSection cityId={cityId} cityName={cityData.name} />
      </div>
    </main>
  );
}
