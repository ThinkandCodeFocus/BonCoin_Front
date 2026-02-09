import type React from "react"
import type { Metadata } from "next"
import { DM_Serif_Display, Sora } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/contexts/AuthContext"
import { FavoritesProvider } from "@/contexts/FavoritesContext"
import { ThemeProvider } from "@/components/theme-provider"
import { MessageNotificationProvider } from "@/contexts/MessageNotificationContext"
import { MessageNotificationToast } from "@/components/message-notification-toast"

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
})

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
})

export const metadata: Metadata = {
  title: "Marketplace - Achetez et vendez en ligne",
  description: "Plateforme de vente et d'achat en ligne au Sénégal",
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
      <body className={`${sora.variable} ${dmSerif.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <AuthProvider>
            <FavoritesProvider>
                            <MessageNotificationProvider>
              {children}
                              <MessageNotificationToast />
              <Toaster />
                          </MessageNotificationProvider>
            </FavoritesProvider>
          </AuthProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
