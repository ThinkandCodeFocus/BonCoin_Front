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
          {/* Brand section */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-accent text-accent-foreground flex items-center justify-center font-bold shadow-lg">
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
              Une plateforme simple et élégante pour trouver les meilleures offres près de chez vous.
            </p>
            {/* Social links */}
            <div className="flex items-center gap-3 pt-2">
              <a 
                href="#" 
                className="w-9 h-9 rounded-full bg-background/10 hover:bg-accent/20 flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a 
                href="#" 
                className="w-9 h-9 rounded-full bg-background/10 hover:bg-accent/20 flex items-center justify-center transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a 
                href="#" 
                className="w-9 h-9 rounded-full bg-background/10 hover:bg-accent/20 flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a 
                href="#" 
                className="w-9 h-9 rounded-full bg-background/10 hover:bg-accent/20 flex items-center justify-center transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div className="space-y-4">
            <p className="font-semibold text-lg">Navigation</p>
            <div className="grid gap-2 text-sm">
              <Link href="/" className="hover:text-accent transition-colors flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-accent" />
                Accueil
              </Link>
              <Link href="/listings" className="hover:text-accent transition-colors flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-accent" />
                Annonces
              </Link>
              <Link href="/publish" className="hover:text-accent transition-colors flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-accent" />
                Déposer une annonce
              </Link>
              <Link href="/favorites" className="hover:text-accent transition-colors flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-accent" />
                Favoris
              </Link>
              <Link href="/messages" className="hover:text-accent transition-colors flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-accent" />
                Messages
              </Link>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <p className="font-semibold text-lg">Catégories</p>
            <div className="grid gap-2 text-sm">
              <Link href="/listings?category=1" className="hover:text-accent transition-colors flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-accent" />
                Téléphones
              </Link>
              <Link href="/listings?category=2" className="hover:text-accent transition-colors flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-accent" />
                Immobilier
              </Link>
              <Link href="/listings?category=3" className="hover:text-accent transition-colors flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-accent" />
                Véhicules
              </Link>
              <Link href="/listings?category=4" className="hover:text-accent transition-colors flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-accent" />
                Meubles
              </Link>
              <Link href="/listings?category=5" className="hover:text-accent transition-colors flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-accent" />
                Mode & Vêtements
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <p className="font-semibold text-lg">Contact</p>
            <div className="grid gap-3 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 text-accent flex-shrink-0" />
                <span className="text-background/80 dark:text-muted-foreground">
                  Dakar, Sénégal
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-accent flex-shrink-0" />
                <a href="tel:+221770000000" className="hover:text-accent transition-colors">
                  +221 77 000 00 00
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-accent flex-shrink-0" />
                <a href="mailto:contact@marketplace.sn" className="hover:text-accent transition-colors">
                  contact@marketplace.sn
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-background/10 dark:border-border/60">
          <div className="max-w-6xl mx-auto px-6 py-4 text-xs text-background/60 dark:text-muted-foreground flex flex-col md:flex-row items-center justify-between gap-4">
            <span>© 2024 Marketplace. Tous droits réservés.</span>
            <div className="flex items-center gap-6">
              <Link href="#" className="hover:text-accent transition-colors">
                Confidentialité
              </Link>
              <Link href="#" className="hover:text-accent transition-colors">
                Conditions générales
              </Link>
              <Link href="#" className="hover:text-accent transition-colors">
                Aide
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
