"use client";

import { SessionProvider } from "next-auth/react";

export default function ClientLayout({ children }) {
  return <SessionProvider>{children}</SessionProvider>;
}
