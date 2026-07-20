"use client"

import Link from "next/link"

export function Footer() {
  return (
    <footer className="mt-12 bg-muted/40 border-t">
      <div className="max-w-6xl mx-auto px-6 py-10 grid gap-8 md:grid-cols-4 text-sm">
        <div className="space-y-3">
          <p className="text-lg font-bold text-primary">LeMarché</p>
          <p className="text-muted-foreground">
            La marketplace C2C leader en France. Simple, rapide et local.
          </p>
        </div>

        <div className="space-y-2">
          <p className="font-semibold">À propos</p>
          <div className="flex flex-col gap-1.5 text-muted-foreground">
            <Link href="#" className="hover:text-primary hover:underline">Qui sommes-nous ?</Link>
            <Link href="#" className="hover:text-primary hover:underline">Nous rejoindre</Link>
            <Link href="#" className="hover:text-primary hover:underline">Publicité</Link>
            <Link href="#" className="hover:text-primary hover:underline">Impact environnemental</Link>
          </div>
        </div>

        <div className="space-y-2">
          <p className="font-semibold">Informations légales</p>
          <div className="flex flex-col gap-1.5 text-muted-foreground">
            <Link href="#" className="hover:text-primary hover:underline">CGU</Link>
            <Link href="#" className="hover:text-primary hover:underline">Confidentialité</Link>
            <Link href="#" className="hover:text-primary hover:underline">Mentions légales</Link>
            <Link href="#" className="hover:text-primary hover:underline">Cookie Policy</Link>
          </div>
        </div>

        <div className="space-y-2">
          <p className="font-semibold">Aide &amp; Contact</p>
          <div className="flex flex-col gap-1.5 text-muted-foreground">
            <Link href="#" className="hover:text-primary hover:underline">Centre d'aide</Link>
            <Link href="#" className="hover:text-primary hover:underline">Règles de diffusion</Link>
            <Link href="#" className="hover:text-primary hover:underline">Conseils de sécurité</Link>
            <Link href="#" className="hover:text-primary hover:underline">Contact</Link>
          </div>
        </div>
      </div>

      <div className="border-t">
        <div className="max-w-6xl mx-auto px-6 py-3 text-xs text-muted-foreground flex flex-col md:flex-row items-center justify-between gap-2">
          <span>© 2024 LeMarché. Tous droits réservés.</span>
          <span>Dakar, Sénégal</span>
        </div>
      </div>
    </footer>
  )
}
