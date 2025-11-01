"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";

export default function Home() {
  const { data: session } = useSession();
  const [email, setEmail] = useState("");

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "24px",
      }}
    >
      <h1>Base para aplicativo web</h1>

      {!session && (
        <section>
          <button onClick={() => signIn("google")}>Entrar com Google</button>

          <hr />

          <form
            onSubmit={(e) => {
              e.preventDefault();
              signIn("email", { email });
            }}
          >
            <label>
              Entrar por email (magic link):
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
              />
            </label>
            <button type="submit">Enviar link</button>
          </form>
        </section>
      )}

      {session && (
        <section>
          <p>
            Conectado como{" "}
            {session.user?.fullName ||
              session.user?.name ||
              session.user?.email}
          </p>
          <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
            <Link href="/profile">
              <button
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                }}
              >
                Atualizar Cadastro
              </button>
            </Link>
            <button
              onClick={() => signOut()}
              style={{
                padding: "8px 16px",
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
              }}
            >
              Sair
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
