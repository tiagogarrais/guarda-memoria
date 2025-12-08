import "./globals.css";

export const metadata = {
  title: "Guarda Memória",
  description: "Aplicação para guardar memórias",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
