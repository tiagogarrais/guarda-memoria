import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import QRCode from "react-qr-code";

const prisma = new PrismaClient();

export default async function QRPage({ params }) {
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
    },
  });

  if (!rawPost) {
    redirect("/");
  }

  // Processar os dados
  const post = {
    ...rawPost,
  };

  // Se for um comentário, redirecionar para o post pai
  if (post.parentId) {
    redirect(`/postagem/${post.parentId}`);
  }

  const getMediaInfo = (type) => {
    switch (type) {
      case "image":
        return { type: "Imagem", verb: "enviada" };
      case "video":
        return { type: "Vídeo", verb: "enviado" };
      case "audio":
        return { type: "Áudio", verb: "enviado" };
      case "text":
        return { type: "Texto", verb: "enviado" };
      default:
        return { type: type, verb: "enviado" };
    }
  };

  return (
    <div className="min-h-screen bg-white p-8 print:pt-0 flex items-center justify-center">
      <div className="max-w-2xl mx-auto text-center">
        {/* Cabeçalho do site */}
        <div className="mb-6">
          <h1 className="text-[62.4px] font-bold text-black mb-2">
            Guarda Memória
          </h1>
          <p className="text-[26px] text-black">
            Preservando memórias das cidades brasileiras
          </p>
        </div>

        {/* Título da postagem */}
        <div className="mb-6">
          <h2 className="text-[28.08px] font-semibold text-black mb-2">
            Memória de {post.city.name}
          </h2>
          {post.text && (
            <p className="text-lg text-black italic">
              &ldquo;
              {post.text.length > 100
                ? post.text.substring(0, 100) + "..."
                : post.text}
              &rdquo;
            </p>
          )}
        </div>

        {/* Informações do envio */}
        <div className="mb-6">
          <p className="text-[15.6px] text-black">
            {getMediaInfo(post.type).type} enviado por{" "}
            {post.user?.displayName || post.user?.name || "Usuário"} em{" "}
            {new Date(post.createdAt).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        {/* QR Code */}
        <div className="mb-6 flex justify-center">
          <QRCode
            value={`${
              process.env.NEXTAUTH_URL || "http://localhost:3000"
            }/postagem/${permalink}?source=qr`}
            size={468}
          />
        </div>

        {/* Chamada para ação */}
        <div className="mb-6">
          <p className="text-lg text-black mb-2">
            Escaneie o QR code para acessar esta memória e descobrir mais sobre{" "}
            {post.city.name}.
          </p>
          <p className="text-[15.6px] text-black">
            Imprima este cartão e cole nos locais das memórias para compartilhar
            com visitantes.
          </p>
        </div>
      </div>
    </div>
  );
}
