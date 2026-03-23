import "./globals.css";

export const metadata = {
  title: "QR Studio",
  description: "SaaS para geracao de QR Code com autenticacao, permissoes e pagamento"
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
