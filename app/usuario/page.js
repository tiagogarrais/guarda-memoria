import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import Header from "../components/Header";
import Image from "next/image";
import FavoriteCitiesSection from "../components/FavoriteCitiesSection";
import DisplayNameForm from "../components/DisplayNameForm";
import ShareButton from "../components/ShareButton";

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
      medias: {
        select: {
          id: true,
          permalink: true,
          createdAt: true,
          type: true,
          text: true,
          url: true,
          city: {
            select: {
              name: true,
              state: { select: { sigla: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) {
    return <div>Usuário não encontrado</div>;
  }

  // Verificar se o usuário é administrador
  const admins = process.env.ADMINS ? process.env.ADMINS.split(",") : [];
  const isAdmin = admins.includes(session.user.email);

  // Função para determinar o tipo de exibição da mídia
  const getMediaDisplayType = (media) => {
    if (media.type && ["image", "video", "audio"].includes(media.type)) {
      switch (media.type) {
        case "image":
          return "Imagem";
        case "video":
          return "Vídeo";
        case "audio":
          return "Áudio";
        default:
          return "Mídia";
      }
    } else {
      return "Texto";
    }
  };

  // Função para determinar a cor do badge
  const getMediaBadgeColor = (media) => {
    if (media.type && ["image", "video", "audio"].includes(media.type)) {
      return "bg-blue-100 text-blue-800"; // Mídia - azul
    } else {
      return "bg-green-100 text-green-800"; // Texto - verde
    }
  };

  return (
    <>
      <Header showUserInfo={true} session={session} isAdmin={isAdmin} />

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
                    Localização Principal
                  </h4>
                  {user.city ? (
                    <div>
                      <p className="text-gray-900">
                        {user.city.name} - {user.city.state.sigla.toUpperCase()}
                      </p>
                      <Link
                        href="/select-location"
                        className="inline-flex items-center mt-2 px-3 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        Alterar Localização Principal
                      </Link>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-500">Não definida</p>
                      <Link
                        href="/select-location"
                        className="inline-flex items-center mt-2 px-3 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        Definir Localização Principal
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Botão de logout */}
            <div className="px-6 py-4 border-t border-gray-200">
              <Link
                href="/api/auth/signout"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Fazer Logout
              </Link>
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
              </div>
            </div>
          </div>

          {/* Seção de cidades favoritas */}
          <FavoriteCitiesSection favoriteCities={user.favoriteCities} />

          {/* Seção de memórias */}
          <div className="bg-white shadow rounded-lg overflow-hidden mt-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Suas Memórias
              </h2>
              <p className="text-gray-600 mb-4">Histórico das suas postagens</p>
            </div>
            <div className="px-6 py-4">
              {user.medias && user.medias.length > 0 ? (
                <div className="space-y-4">
                  {user.medias.map((media) => (
                    <div
                      key={media.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div className="text-sm text-gray-500">
                            {new Date(media.createdAt).toLocaleDateString(
                              "pt-BR"
                            )}
                          </div>
                          <div className="text-sm">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getMediaBadgeColor(
                                media
                              )}`}
                            >
                              {getMediaDisplayType(media)}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {media.city
                              ? `${
                                  media.city.name
                                } - ${media.city.state.sigla.toUpperCase()}`
                              : "Sem localização"}
                          </div>
                        </div>
                        {media.text && (
                          <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                            {media.text}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Link
                          href={`/postagem/${media.permalink}`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Ver
                        </Link>
                        <ShareButton
                          url={`${
                            process.env.NEXT_PUBLIC_BASE_URL ||
                            "http://localhost:3000"
                          }/postagem/${media.permalink}`}
                          text={media.text || "Confira esta memória"}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Você ainda não compartilhou nenhuma memória.
                  <Link
                    href="/"
                    className="text-blue-600 hover:text-blue-800 ml-1"
                  >
                    Comece agora!
                  </Link>
                </p>
              )}
            </div>
          </div>

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
