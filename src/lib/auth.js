import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import { sendVerificationRequest } from "@/lib/email";

export const authOptions = {
  debug: true,
  adapter: PrismaAdapter(prisma),
  // Permitir account linking automático
  allowDangerousEmailAccountLinking: true,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: process.env.EMAIL_SERVER_PORT,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASS,
        },
      },
      from: process.env.EMAIL_FROM,
      sendVerificationRequest,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/",
    error: "/auth/error",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        console.log("SignIn attempt:", { 
          email: user?.email, 
          provider: account?.provider 
        });

        // Se for Google OAuth, verificar se já existe um usuário com o mesmo email
        if (account?.provider === "google" && user?.email) {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          if (existingUser) {
            console.log("Usuário existente encontrado, permitindo vinculação:", existingUser.id);
            // Permite a vinculação da conta Google ao usuário existente
            return true;
          }
        }

        // Para outros casos, sempre permitir
        return true;
      } catch (error) {
        console.error("Erro no callback signIn:", error);
        return false;
      }
    },
    async session({ session, token }) {
      try {
        // Adicionar o id do usuário do token
        if (token?.id) {
          session.user.id = token.id;
        }

        // Adicionar campos do perfil da tabela Usuario
        if (token?.id) {
          try {
            const profile = await prisma.usuario.findUnique({
              where: { userId: token.id },
            });
            if (profile) {
              session.user = {
                ...session.user,
                fullName: profile.fullName,
                birthDate: profile.birthDate,
                cpf: profile.cpf,
                whatsapp: profile.whatsapp,
                whatsappCountryCode: profile.whatsappCountryCode,
                whatsappConsent: profile.whatsappConsent,
              };
            }
          } catch (dbError) {
            console.error("Erro ao buscar dados do usuário no banco:", dbError);
          }
        }
        return session;
      } catch (error) {
        console.error("Erro no callback de sessão:", error);
        return session;
      }
    },
    async jwt({ token, user, account, profile }) {
      try {
        // Adicionar o id do usuário ao token quando ele faz login
        if (user?.id) {
          token.id = user.id;
        }

        // Se for um novo login OAuth, buscar o usuário existente
        if (account?.provider === "google" && profile?.email) {
          const existingUser = await prisma.user.findUnique({
            where: { email: profile.email },
          });
          if (existingUser) {
            token.id = existingUser.id;
          }
        }

        return token;
      } catch (error) {
        console.error("Erro no callback JWT:", error);
        return token;
      }
    },
    async redirect({ url, baseUrl }) {
      // Permite redirecionamentos externos (como Google OAuth)
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Ou se a URL é relativa, prefixa com baseUrl
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
};
