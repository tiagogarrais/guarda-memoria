import { getServerSession } from "next-auth";
import { authOptions } from "../../auth";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import { Pacifico } from "next/font/google";
import Header from "../../components/Header";
import SinglePostView from "../../components/SinglePostView";

const prisma = new PrismaClient();

const pacifico = Pacifico({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

export default async function PostPage({ params }) {
  const session = await getServerSession(authOptions);
  const { permalink } = await params;

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

  // Buscar a postagem pelo permalink
  const rawPost = await prisma.media.findUnique({
    where: { permalink },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          displayName: true,
        },
      },
      city: {
        select: {
          id: true,
          name: true,
          slug: true,
          state: { select: { sigla: true } },
        },
      },
      replies: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              displayName: true,
            },
          },
          replies: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  displayName: true,
                },
              },
            },
            orderBy: { createdAt: "asc" },
          },
          _count: {
            select: {
              knowledge: true,
            },
          },
          knowledge: {
            where: {
              userId: user.id,
            },
            select: {
              id: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
      _count: {
        select: {
          knowledge: true,
        },
      },
      knowledge: {
        where: {
          userId: user.id,
        },
        select: {
          id: true,
        },
      },
    },
  });

  if (!rawPost) {
    return (
      <>
        <Header showUserInfo={true} session={session} user={user} />
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Postagem não encontrada
            </h1>
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              Voltar para a página inicial
            </Link>
          </div>
        </main>
      </>
    );
  }

  // Processar os dados para incluir informações de conhecimento
  const post = {
    ...rawPost,
    knowledgeCount: rawPost._count.knowledge,
    userKnows: rawPost.knowledge.length > 0,
    _count: undefined,
    knowledge: undefined,
    replies: rawPost.replies.map((reply) => ({
      ...reply,
      knowledgeCount: reply._count.knowledge,
      userKnows: reply.knowledge.length > 0,
      _count: undefined,
      knowledge: undefined,
    })),
  };

  // Se for um comentário, redirecionar para o post pai
  if (post.parentId) {
    const parentPost = await prisma.media.findUnique({
      where: { id: post.parentId },
      select: { permalink: true },
    });

    if (parentPost) {
      redirect(`/postagem/${parentPost.permalink}`);
    }
  }

  return (
    <>
      <Header showUserInfo={true} session={session} user={user} />

      <main className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Breadcrumb */}
          <nav className="mb-6">
            <Link
              href={`/cidade/${post.city.slug}`}
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              ← Voltar para {post.city.name} -{" "}
              {post.city.state.sigla.toUpperCase()}
            </Link>
          </nav>

          {/* Título da página */}
          <div className="text-center mb-8">
            <h1
              className={`text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 ${pacifico.className}`}
            >
              Publicação
            </h1>
          </div>

          {/* Visualização da postagem */}
          <SinglePostView post={post} user={user} citySlug={post.city.slug} />

          {/* Breadcrumb no final */}
          <nav className="mt-12 pt-8 border-t border-gray-200">
            <Link
              href={`/cidade/${post.city.slug}`}
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              ← Voltar para {post.city.name} -{" "}
              {post.city.state.sigla.toUpperCase()}
            </Link>
          </nav>
        </div>
      </main>
    </>
  );
}
