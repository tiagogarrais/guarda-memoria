import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth";
import { redirect } from "next/navigation";
import { getProviders, signIn } from "next-auth/react";
import SignInForm from "../../components/SignInForm";

export default async function SignInPage() {
  const session = await getServerSession(authOptions);

  // Se já estiver logado, redirecionar para select-location
  if (session) {
    redirect("/select-location");
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center mb-6">Guarda Memória</h1>
        <p className="text-gray-600 text-center mb-8">
          Entre com sua conta para compartilhar suas memórias
        </p>

        <SignInForm />

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Compartilhe momentos especiais da sua cidade</p>
        </div>
      </div>
    </div>
  );
}
