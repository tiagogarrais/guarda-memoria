import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import Header from "../components/Header";
import Image from "next/image";
import FavoriteCitiesSection from "../components/FavoriteCitiesSection";
import DisplayNameForm from "../components/DisplayNameForm";

const prisma = new PrismaClient();

export default async function UserPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  // Buscar dados do usuário
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      name: true,
      displayName: true,
      email: true,
      image: true,
      stateId: true,
      cityId: true,
      city: {
        select: {
          name: true,
          state: { select: { sigla: true } },
        },
      },
      favoriteCities: {
        select: {
          id: true,
          name: true,
          slug: true,
          state: { select: { sigla: true } },
        },
        orderBy: { name: "asc" },
      },
    },
  });

  if (!user) {
    return <div>Usuário não encontrado</div>;
  }

  return (
    <>
      <Header showUserInfo={true} session={session} />

      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Cabeçalho da página */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Meu Perfil
            </h1>
            <p className="text-gray-600">
              Gerencie suas informações pessoais e preferências
            </p>
          </div>

          {/* Card principal */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {/* Seção de informações básicas */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Informações Básicas
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Avatar e nome */}
                <div className="flex items-center space-x-4">
                  {user.image && (
                    <Image
                      src={user.image}
                      alt="Avatar"
                      width={64}
                      height={64}
                      className="w-16 h-16 rounded-full"
                    />
                  )}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {user.displayName || user.name || "Usuário"}
                    </h3>
                    <p className="text-gray-500">{user.email}</p>
                  </div>
                </div>

                {/* Localização */}
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">
                    Localização
                  </h4>
                  {user.city ? (
                    <p className="text-gray-900">
                      {user.city.name} - {user.city.state.sigla.toUpperCase()}
                    </p>
                  ) : (
                    <p className="text-gray-500">Não definida</p>
                  )}
                </div>
              </div>
            </div>

            {/* Seção de configurações */}
            <div className="px-6 py-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Configurações
              </h2>

              <div className="space-y-4">
                {/* Nome de exibição */}
                <DisplayNameForm
                  currentDisplayName={user.displayName}
                  userName={user.name}
                />

                {/* Link para alterar localização */}
                <div className="pt-4 border-t border-gray-200">
                  <Link
                    href="/select-location"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Alterar Localização
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Seção de cidades favoritas */}
          <FavoriteCitiesSection favoriteCities={user.favoriteCities} />

          {/* Botão voltar */}
          <div className="mt-8 text-center">
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              ← Voltar ao início
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
