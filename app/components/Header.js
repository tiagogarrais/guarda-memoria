"use client";

import Link from "next/link";
import { getUserDisplayName } from "../../lib/userUtils";

export default function Header({
  showUserInfo = false,
  session = null,
  user = null,
}) {
  const displayName = user
    ? getUserDisplayName(user)
    : session?.user?.name || "Usuário";

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex-1 flex justify-center">
            <Link href="/">
              <h1 className="text-xl font-bold text-gray-900">
                Guarda Memória
              </h1>
            </Link>
          </div>
          {showUserInfo && session && (
            <div className="flex items-center space-x-4">
              <Link
                href="/usuario"
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                Meu Perfil
              </Link>
              <span className="text-gray-700">Olá, {displayName}</span>
              <Link
                href="/api/auth/signout"
                className="bg-red-500 text-white px-3 py-1 text-sm rounded-lg hover:bg-red-600 transition-colors"
              >
                Sair
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
