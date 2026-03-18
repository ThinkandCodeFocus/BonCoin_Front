"use client"

import Link from "next/link"
import { Mail, MapPin, Phone, Facebook, Twitter, Instagram, Linkedin } from "lucide-react"

export function Footer() {
  return (
    <footer className="relative mt-16 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.35),transparent_60%)] dark:bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_60%)]" />
      <div className="absolute -top-24 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-foreground/10 dark:to-white/10" />
      <div className="relative bg-foreground text-background dark:bg-card dark:text-foreground">
        <div className="max-w-6xl mx-auto px-6 py-12 grid gap-10 md:grid-cols-4">
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-accent text-accent-foreground flex items-center justify-center font-bold shadow-lg">
                M
              </div>
              <div>
                <p data-i18n="brand.title" className="display-font text-xl font-semibold">Marketplace</p>
                <p data-i18n="brand.tagline" className="text-sm text-background/70 dark:text-muted-foreground">
                  Achetez et vendez localement
                </p>
              </div>
            </div>
            <p data-i18n="brand.description" className="text-sm text-background/70 dark:text-muted-foreground max-w-xs">
              Une plateforme simple et élégante pour trouver les meilleures offres près de chez vous.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a href="#" className="w-9 h-9 rounded-full bg-background/10 hover:bg-accent/20 flex items-center justify-center transition-colors" aria-label="Facebook">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-background/10 hover:bg-accent/20 flex items-center justify-center transition-colors" aria-label="Twitter">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-background/10 hover:bg-accent/20 flex items-center justify-center transition-colors" aria-label="Instagram">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-background/10 hover:bg-accent/20 flex items-center justify-center transition-colors" aria-label="LinkedIn">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <p data-i18n="footer.navigation" className="font-semibold text-lg">Navigation</p>
            <div className="grid gap-2 text-sm">
              <Link href="/" className="hover:text-accent transition-colors flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-accent" />
                <span data-i18n="home">Accueil</span>
              </Link>
              <Link href="/listings" className="hover:text-accent transition-colors flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-accent" />
                <span data-i18n="my_listings">Annonces</span>
              </Link>
              <Link href="/publish" className="hover:text-accent transition-colors flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-accent" />
                <span data-i18n="publish">Déposer une annonce</span>
              </Link>
              <Link href="/favorites" className="hover:text-accent transition-colors flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-accent" />
                <span data-i18n="favorites">Favoris</span>
              </Link>
              <Link href="/messages" className="hover:text-accent transition-colors flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-accent" />
                <span data-i18n="messages">Messages</span>
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <p data-i18n="footer.categories" className="font-semibold text-lg">Catégories</p>
            <div className="grid gap-2 text-sm">
              <Link href="/listings?category=1" className="hover:text-accent transition-colors flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-accent" />
                <span data-i18n="categories.telephones">Téléphones</span>
              </Link>
              <Link href="/listings?category=2" className="hover:text-accent transition-colors flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-accent" />
                <span data-i18n="categories.immobilier">Immobilier</span>
              </Link>
              <Link href="/listings?category=3" className="hover:text-accent transition-colors flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-accent" />
                <span data-i18n="categories.vehicules">Véhicules</span>
              </Link>
              <Link href="/listings?category=4" className="hover:text-accent transition-colors flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-accent" />
                <span data-i18n="categories.meubles">Meubles</span>
              </Link>
              <Link href="/listings?category=5" className="hover:text-accent transition-colors flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-accent" />
                <span data-i18n="categories.mode">Mode & Vêtements</span>
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <p className="font-semibold text-lg">Contact</p>
            <div className="grid gap-3 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 text-accent flex-shrink-0" />
                <span className="text-background/80 dark:text-muted-foreground">Dakar, Senegal</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-accent flex-shrink-0" />
                <a href="tel:+221770000000" className="hover:text-accent transition-colors">+221 77 000 00 00</a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-accent flex-shrink-0" />
                <a href="mailto:contact@marketplace.sn" className="hover:text-accent transition-colors">contact@marketplace.sn</a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-background/10 dark:border-border/60">
          <div className="max-w-6xl mx-auto px-6 py-4 text-xs text-background/60 dark:text-muted-foreground flex flex-col md:flex-row items-center justify-between gap-4">
            <span data-i18n="footer.copyright">© 2024 Marketplace. Tous droits réservés.</span>
            <div className="flex items-center gap-6">
              <Link href="#" className="hover:text-accent transition-colors">
                <span data-i18n="footer.privacy">Confidentialité</span>
              </Link>
              <Link href="#" className="hover:text-accent transition-colors">
                <span data-i18n="footer.terms">Conditions générales</span>
              </Link>
              <Link href="#" className="hover:text-accent transition-colors">
                <span data-i18n="footer.help">Aide</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

