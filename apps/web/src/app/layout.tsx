import type { Metadata } from "next"
import { Outfit, Plus_Jakarta_Sans } from "next/font/google"
import "./globals.css"

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
})

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
})

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
    <html
      lang="pt-BR"
      className={`${outfit.variable} ${plusJakartaSans.variable}`}
    >
      <body className="font-body text-foreground bg-background">
        {children}
      </body>
    </html>
  )
}
