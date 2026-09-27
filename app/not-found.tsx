
"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, ArrowLeft, Search } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center space-y-6 max-w-md">
        {/* 404 Visual */}
        <div className="relative">
          <h1 className="text-[150px] font-bold text-foreground/10 leading-none select-none" aria-hidden="true">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center">
              <Search className="w-12 h-12 text-muted-foreground" aria-hidden="true" />
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Page non trouvée
          </h2>
          <p className="text-muted-foreground">
            Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Button asChild className="gap-2">
            <Link href="/">
              <Home className="w-4 h-4" />
              Retour à l'accueil
            </Link>
          </Button>
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Page précédente
          </Button>
        </div>

        {/* Quick Links */}
        <div className="pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground mb-3">
            Vous pouvez aussi explorer:
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link
              href="/listings"
              className="text-sm text-primary hover:underline"
            >
              Annonces
            </Link>
            <span className="text-muted-foreground/50">•</span>
            <Link
              href="/publish"
              className="text-sm text-primary hover:underline"
            >
              Déposer une annonce
            </Link>
            <span className="text-muted-foreground/50">•</span>
            <Link
              href="/auth"
              className="text-sm text-primary hover:underline"
            >
              Connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

