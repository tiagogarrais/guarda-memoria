"use client";

import Link from "next/link";
import { getUserDisplayName } from "../../lib/userUtils";

export default function Header({
  showUserInfo = false,
  session = null,
  user = null,
  isAdmin = false,
}) {
  const displayName = user
    ? getUserDisplayName(user)
    : session?.user?.name || "Usuário";

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3 sm:py-4">
          {/* Logo/Title - Left on mobile, center on larger screens */}
          <div className="flex-1 sm:flex-none sm:flex-1 sm:flex sm:justify-center">
            <Link href="/">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                Guarda Memória
              </h1>
            </Link>
          </div>

          {/* User Info - Hidden on mobile, shown on larger screens */}
          {showUserInfo && session && (
            <div className="hidden sm:flex items-center space-x-3 lg:space-x-4">
              {isAdmin && (
                <Link
                  href="/admin"
                  className="bg-blue-500 text-white px-2 py-1 lg:px-3 lg:py-1 text-xs lg:text-sm rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Painel Admin
                </Link>
              )}
              <Link
                href="/usuario"
                className="text-gray-700 hover:text-blue-600 transition-colors text-sm lg:text-base"
              >
                Meu Perfil
              </Link>
              <span className="text-gray-700 text-sm lg:text-base truncate max-w-24 lg:max-w-none">
                Olá, {displayName}
              </span>
              <Link
                href="/api/auth/signout"
                className="bg-red-500 text-white px-2 py-1 lg:px-3 lg:py-1 text-xs lg:text-sm rounded-lg hover:bg-red-600 transition-colors"
              >
                Sair
              </Link>
            </div>
          )}

          {/* Mobile Menu Button - Only shown when user is logged in on mobile */}
          {showUserInfo && session && (
            <div className="sm:hidden flex items-center space-x-2">
              {isAdmin && (
                <Link
                  href="/admin"
                  className="text-gray-700 hover:text-blue-600 transition-colors p-2"
                  title="Painel Admin"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </Link>
              )}
              <Link
                href="/usuario"
                className="text-gray-700 hover:text-blue-600 transition-colors p-2"
                title="Meu Perfil"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
