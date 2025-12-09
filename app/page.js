import { getServerSession } from "next-auth";
import { authOptions } from "@/app/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import FeedSection from "./components/FeedSection";

const prisma = new PrismaClient();

export default async function Home() {
  const session = await getServerSession(authOptions);

  let userCity = null;
  if (session) {
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
      where: { id: user.cityId },
      select: { id: true, name: true },
    });

    userCity = cityData;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          Bem vindo ao Guarda memoria
        </p>
        <div className="flex items-center space-x-4">
          {session ? (
            <>
              <p>Olá, {session.user?.name}</p>
              {userCity && (
                <>
                  <Link
                    href={`/cidade/${userCity.id}`}
                    className="bg-green-500 text-white px-4 py-2 rounded"
                  >
                    Página de {userCity.name}
                  </Link>
                </>
              )}
              <Link
                href="/api/auth/signout"
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Sair
              </Link>
            </>
          ) : (
            <Link
              href="/api/auth/signin/google"
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Entrar com Google
            </Link>
          )}
        </div>
      </div>
      {session && <FeedSection userCity={userCity} />}
    </main>
  );
}
