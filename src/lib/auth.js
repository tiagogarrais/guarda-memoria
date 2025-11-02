import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import { sendVerificationRequest } from "@/lib/email";

export const authOptions = {
  adapter: PrismaAdapter(prisma), // Usar adapter padrão temporariamente
  debug: process.env.NODE_ENV === "development",
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
    strategy: "database",
  },
  pages: {
    // you can customize sign in/out/error etc here
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        console.log("SignIn callback:", {
          user: user?.email,
          account: account?.provider,
          userId: user?.id,
          userIdType: typeof user?.id,
        });
        return true;
      } catch (error) {
        console.error("Erro no callback signIn:", error);
        return false;
      }
    },
    async session({ session, token }) {
      try {
        // Para database sessions, o id pode não vir no token, buscar pelo email
        if (session.user.email) {
          const dbUser = await prisma.user.findUnique({
            where: { email: session.user.email },
          });
          if (dbUser) {
            session.user.id = dbUser.id;
          }
        } else if (token && token.id) {
          session.user.id = token.id;
        }

        // Adicionar campos do perfil da tabela Usuario
        if (session.user.id) {
          try {
            const profile = await prisma.usuario.findUnique({
              where: { userId: session.user.id },
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
    async jwt({ token, user }) {
      try {
        if (user) {
          console.log(
            "JWT callback - user.id:",
            user.id,
            "type:",
            typeof user.id
          );
          token.id = user.id;
        }
        return token;
      } catch (error) {
        console.error("Erro no callback JWT:", error);
        return token;
      }
    },
  },
};
