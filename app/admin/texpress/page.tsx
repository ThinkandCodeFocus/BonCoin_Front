"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw, Globe, CheckCircle2, AlertCircle } from "lucide-react"
import { adminService } from "@/lib/api"

function ResultBanner({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 border rounded-lg p-3 text-sm bg-muted/30">
      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
      <div>{children}</div>
    </div>
  )
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 border border-destructive/30 rounded-lg p-3 text-sm bg-destructive/5">
      <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
      <p className="text-destructive">{message}</p>
    </div>
  )
}

export default function AdminTexpressPage() {
  const [texpressLoading, setTexpressLoading] = useState(false)
  const [texpressResult, setTexpressResult] = useState<{ created: number; updated: number; products_found: number } | null>(null)
  const [texpressError, setTexpressError] = useState<string | null>(null)

  const [scrapeLoading, setScrapeLoading] = useState(false)
  const [scrapeResult, setScrapeResult] = useState<{ created: number; updated: number; errors: string[] } | null>(null)
  const [scrapeError, setScrapeError] = useState<string | null>(null)

  const handleSyncTexpress = async () => {
    setTexpressLoading(true)
    setTexpressResult(null)
    setTexpressError(null)

    const response = await adminService.syncTexpress()

    if (response.success && response.data) {
      setTexpressResult(response.data)
    } else {
      setTexpressError((response as { message?: string }).message || "Échec de la synchronisation")
    }

    setTexpressLoading(false)
  }

  const handleScrape = async () => {
    setScrapeLoading(true)
    setScrapeResult(null)
    setScrapeError(null)

    const response = await adminService.scrapeSync()

    if (response.success && response.data) {
      setScrapeResult(response.data)
    } else {
      setScrapeError((response as { message?: string }).message || "Échec du scraping")
    }

    setScrapeLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pb-16 md:pb-4">
        <AdminLayout>
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-base font-semibold">Import T-Express</h1>
              <p className="text-sm text-muted-foreground">
                Récupère les produits actifs de T-Express et les publie comme annonces (avec une marge appliquée sur
                le prix). Les annonces déjà importées sont mises à jour, pas dupliquées.
              </p>

              <Button onClick={handleSyncTexpress} disabled={texpressLoading} className="gap-2">
                {texpressLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Récupérer les offres T-Express
              </Button>

              {texpressResult && (
                <ResultBanner>
                  <p className="font-medium">Synchronisation terminée</p>
                  <p className="text-muted-foreground">
                    {texpressResult.products_found} produit(s) trouvé(s) — {texpressResult.created} annonce(s) créée(s),{" "}
                    {texpressResult.updated} mise(s) à jour.
                  </p>
                </ResultBanner>
              )}
              {texpressError && <ErrorBanner message={texpressError} />}
            </div>

            <div className="space-y-4 border-t pt-6">
              <h2 className="text-base font-semibold">Scraping sites partenaires</h2>
              <p className="text-sm text-muted-foreground">
                Importe des produits en stock depuis des sites e-commerce partenaires (Kabirex, Soumari, Digital
                Stores) avec la même marge. Chaque annonce garde un lien interne vers la fiche produit d'origine,
                visible uniquement par toi dans la conversation liée — jamais envoyé au client — pour passer la
                commande et organiser la livraison.
              </p>

              <Button onClick={handleScrape} disabled={scrapeLoading} variant="secondary" className="gap-2">
                {scrapeLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                Lancer le scraping
              </Button>

              {scrapeResult && (
                <ResultBanner>
                  <p className="font-medium">Scraping terminé</p>
                  <p className="text-muted-foreground">
                    {scrapeResult.created} annonce(s) créée(s), {scrapeResult.updated} mise(s) à jour.
                  </p>
                  {scrapeResult.errors.length > 0 && (
                    <p className="text-destructive mt-1">{scrapeResult.errors.join(" · ")}</p>
                  )}
                </ResultBanner>
              )}
              {scrapeError && <ErrorBanner message={scrapeError} />}
            </div>
          </div>
        </AdminLayout>
      </main>
      <BottomNav />
    </div>
  )
}
