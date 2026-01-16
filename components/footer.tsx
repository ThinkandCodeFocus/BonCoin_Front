"use client"

import Link from "next/link"
import { Mail, MapPin, Phone } from "lucide-react"

export function Footer() {
  return (
    <footer className="relative mt-16 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.35),transparent_60%)] dark:bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_60%)]" />
      <div className="absolute -top-24 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-foreground/10 dark:to-white/10" />
      <div className="relative bg-foreground text-background dark:bg-card dark:text-foreground">
        <div className="max-w-6xl mx-auto px-6 py-12 grid gap-10 md:grid-cols-3">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-accent text-accent-foreground flex items-center justify-center font-bold">
                M
              </div>
              <div>
                <p className="display-font text-xl font-semibold">Marketplace</p>
                <p className="text-sm text-background/70 dark:text-muted-foreground">
                  Achetez et vendez localement
                </p>
              </div>
            </div>
            <p className="text-sm text-background/70 dark:text-muted-foreground max-w-xs">
              Une plateforme simple et elegante pour trouver les meilleures offres pres de chez vous.
            </p>
          </div>

          <div className="space-y-3">
            <p className="font-semibold text-lg">Liens utiles</p>
            <div className="grid gap-2 text-sm">
              <Link href="/listings" className="hover:text-accent transition-colors">
                Annonces
              </Link>
              <Link href="/publish" className="hover:text-accent transition-colors">
                Deposer une annonce
              </Link>
              <Link href="/favorites" className="hover:text-accent transition-colors">
                Favoris
              </Link>
              <Link href="/messages" className="hover:text-accent transition-colors">
                Messages
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            <p className="font-semibold text-lg">Contact</p>
            <div className="grid gap-3 text-sm text-background/80 dark:text-muted-foreground">
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Dakar, Senegal
              </span>
              <span className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                +221 77 000 00 00
              </span>
              <span className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                contact@marketplace.sn
              </span>
            </div>
          </div>
        </div>
        <div className="border-t border-background/10 dark:border-border/60">
          <div className="max-w-6xl mx-auto px-6 py-4 text-xs text-background/60 dark:text-muted-foreground flex flex-col md:flex-row items-center justify-between gap-2">
            <span>© 2024 Marketplace. Tous droits reserves.</span>
            <div className="flex items-center gap-4">
              <Link href="#" className="hover:text-accent transition-colors">
                Confidentialite
              </Link>
              <Link href="#" className="hover:text-accent transition-colors">
                Conditions
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
