import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/api/auth/signin");
  }

  // Verificar se o usuário é admin
  const admins = process.env.ADMINS ? process.env.ADMINS.split(",") : [];
  if (!admins.includes(session.user.email)) {
    redirect("/");
  }

  // Buscar todas as postagens
  const posts = await prisma.media.findMany({
    include: {
      user: { select: { displayName: true, name: true } },
      city: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Buscar usuários com contagem de publicações
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      displayName: true,
      email: true,
      createdAt: true,
      _count: {
        select: { medias: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Contador total de visitas
  const totalVisits = await prisma.visit.count();

  // Top postagens por visitas totais (score + qrVisits)
  const topPosts = await prisma.media.findMany({
    include: {
      user: { select: { displayName: true, name: true } },
      city: { select: { name: true } },
    },
    orderBy: { score: "desc" }, // Por enquanto, usar score; depois pode ser score + qrVisits
    take: 5,
  });

  // Total de visitas via QR
  const qrVisitsTotal = await prisma.media.aggregate({
    _sum: { qrVisits: true },
  });

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">
          Painel de Administração - Guarda Memória
        </h1>

        {/* Contadores Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Total de Visitas</h2>
            <p className="text-3xl font-bold text-blue-600">{totalVisits}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Postagens Publicadas</h2>
            <p className="text-3xl font-bold text-green-600">{posts.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Usuários Cadastrados</h2>
            <p className="text-3xl font-bold text-orange-600">{users.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Visitas via QR</h2>
            <p className="text-3xl font-bold text-purple-600">
              {qrVisitsTotal._sum.qrVisits || 0}
            </p>
          </div>
        </div>

        {/* Lista de Usuários */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-2xl font-semibold mb-4">Usuários Cadastrados</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">Nome</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Data de Cadastro</th>
                  <th className="px-4 py-2 text-left">Publicações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t">
                    <td className="px-4 py-2">
                      {user.displayName || user.name || "Sem nome"}
                    </td>
                    <td className="px-4 py-2">{user.email}</td>
                    <td className="px-4 py-2">
                      {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-4 py-2">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                        {user._count.medias}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Lista de Postagens */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-2xl font-semibold mb-4">Log de Postagens</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">Data</th>
                  <th className="px-4 py-2 text-left">Cidade</th>
                  <th className="px-4 py-2 text-left">Usuário</th>
                  <th className="px-4 py-2 text-left">Tipo</th>
                  <th className="px-4 py-2 text-left">QR Visits</th>
                  <th className="px-4 py-2 text-left">Link</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id} className="border-t">
                    <td className="px-4 py-2">
                      {new Date(post.createdAt).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-4 py-2">{post.city.name}</td>
                    <td className="px-4 py-2">
                      {post.user?.displayName || post.user?.name || "Anônimo"}
                    </td>
                    <td className="px-4 py-2 capitalize">{post.type}</td>
                    <td className="px-4 py-2">{post.qrVisits}</td>
                    <td className="px-4 py-2">
                      <a
                        href={`/postagem/${post.permalink}`}
                        className="text-blue-600 hover:underline"
                        target="_blank"
                      >
                        Ver Postagem
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Postagens */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">Top Postagens</h2>
          <ul>
            {topPosts.map((post, index) => (
              <li key={post.id} className="mb-2">
                {index + 1}. {post.city.name} -{" "}
                {post.user?.displayName || post.user?.name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
