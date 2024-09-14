import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "./components/Header/header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sistema de Gerenciamento De Microrrede De Energia Renovavel",
  description: "Uma interface de gerenciamento para uma microrrede de energia renovavel da UEFS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body className={inter.className}>
        <Header/>
        <div className="bg-custom">
          {children}
        </div>
        
      </body>
    </html>
  );
}
