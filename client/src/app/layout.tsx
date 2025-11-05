// app/layout.tsx

import type { Metadata } from "next";
import { Geist } from "next/font/google";
import type React from "react";
import "./globals.css";
import { Toaster } from "sonner";

// O Header NÃO é mais importado aqui
import { ThemeProvider } from "@/components/theme/theme-provider";
import Providers from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Gestão de Frotas",
    template: "%s | Gestão de Frotas",
  },
  description: "Sistema de gerenciamento de viagens e veículos",
  keywords: ["gestão de frotas", "veículos", "viagens", "painel", "sistema"],
  authors: [{ name: "Sua empresa ou equipe" }],
  openGraph: {
    title: "Gestão de Frotas",
    description: "Gerencie viagens e veículos com eficiência.",
    type: "website",
    locale: "pt_BR",
    url: "https://seudominio.com",
    siteName: "Gestão de Frotas",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      {/* REMOVEMOS as classes flex daqui */}
      <body className={`${geistSans.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            {/* O Header e o Main saem daqui.
                Renderizamos {children} diretamente. */}
            {children}
            <Toaster richColors />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
