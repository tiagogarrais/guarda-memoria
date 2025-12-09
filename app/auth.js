import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    session: async ({ session, user }) => {
      if (user) {
        session.user.id = user.id;
      }
      return session;
    },
    signIn: async ({ user }) => {
      // Buscar a cidade do usuário após login
      const userData = await prisma.user.findUnique({
        where: { email: user.email },
        select: { cityId: true },
      });

      if (userData?.cityId) {
        // Redirecionar para a página da cidade
        return `/cidade/${userData.cityId}`;
      }

      // Se não tiver cidade definida, redirecionar para seleção de localização
      return "/select-location";
    },
  },
};

export default NextAuth(authOptions);
