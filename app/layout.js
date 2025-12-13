import "./globals.css";
import ClientLayout from "./client-layout";

export const metadata = {
  title: "Guarda Memória",
  description: "Aplicação para guardar memórias",
  other: {
    "Content-Language": "pt-BR",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="Content-Language" content="pt-BR" />
      </head>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
