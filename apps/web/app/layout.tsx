import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Mio",
  description: "Plataforma de aprendizado de programação",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
