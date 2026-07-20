import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/contexts/AuthContext"
import { FavoritesProvider } from "@/contexts/FavoritesContext"
import { ThemeProvider } from "@/components/theme-provider"
import { MessageNotificationProvider } from "@/contexts/MessageNotificationContext"
import { MessageNotificationToast } from "@/components/message-notification-toast"
import { I18nProvider } from "@/components/I18nProvider"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Marketplace - Petites annonces",
  description: "Achat et vente de particulier à particulier au Sénégal",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <I18nProvider>
            <AuthProvider>
              <FavoritesProvider>
                <MessageNotificationProvider>
                  {children}
                  <MessageNotificationToast />
                  <Toaster />
                </MessageNotificationProvider>
              </FavoritesProvider>
            </AuthProvider>
          </I18nProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
