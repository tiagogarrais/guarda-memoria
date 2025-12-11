import "./globals.css";
import ClientLayout from "./client-layout";

export const metadata = {
  title: "Guarda Memória",
  description: "Aplicação para guardar memórias",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
