/**
 * Retorna o nome de exibição do usuário
 * Prioriza displayName personalizado, depois name do Google
 */
export function getUserDisplayName(user) {
  if (!user) return "Usuário";

  // Se tem displayName personalizado, usa ele
  if (user.displayName && user.displayName.trim()) {
    return user.displayName.trim();
  }

  // Senão, usa o name do Google
  if (user.name) {
    return user.name;
  }

  // Fallback
  return "Usuário";
}
