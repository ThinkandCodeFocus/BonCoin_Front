import type React from "react"
import type { Metadata, Viewport } from "next"
import { Fraunces, DM_Sans } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/contexts/AuthContext"
import { FavoritesProvider } from "@/contexts/FavoritesContext"
import { ThemeProvider } from "@/components/theme-provider"
import { MessageNotificationProvider } from "@/contexts/MessageNotificationContext"
import { MessageNotificationToast } from "@/components/message-notification-toast"
import { I18nProvider } from "@/components/I18nProvider"
import { PwaInstallPrompt } from "@/components/pwa-install-prompt"
import { VisitTracker } from "@/components/visit-tracker"
import { SignupBanner } from "@/components/signup-banner"

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: "variable",
  axes: ["opsz", "SOFT", "WONK"],
  style: ["normal", "italic"],
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
})

export const metadata: Metadata = {
  title: "LeMarché - Petites annonces au Sénégal",
  description: "Achat et vente de particulier à particulier au Sénégal",
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
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "LeMarché",
  },
}

export const viewport: Viewport = {
  themeColor: "#2f4a3a",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className="overflow-x-hidden">
      <body className={`${fraunces.variable} ${dmSans.variable} font-sans antialiased overflow-x-hidden`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <I18nProvider>
            <AuthProvider>
              <FavoritesProvider>
                <MessageNotificationProvider>
                  {children}
                  <MessageNotificationToast />
                  <Toaster />
                  <PwaInstallPrompt />
                  <VisitTracker />
                  <SignupBanner />
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
