import "./globals.css";
import { Manrope, Space_Grotesk } from "next/font/google";

const bodyFont = Manrope({
  subsets: ["latin"],
  variable: "--font-body"
});

const headingFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading"
});

export const metadata = {
  title: "QR Studio | Plataforma PRO de QR Code",
  description: "SaaS de geracao de QR Code com permissao por perfil, assinatura Mercado Pago e painel administrativo"
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className={`${bodyFont.variable} ${headingFont.variable}`}>{children}</body>
    </html>
  );
}
