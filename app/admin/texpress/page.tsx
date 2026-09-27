"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw, Globe, Briefcase, Home, CheckCircle2, AlertCircle } from "lucide-react"
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

const SCRAPE_GROUPS = [
  { key: "electronique-maison", label: "Électronique & Maison", sites: ["kabirex", "soumari", "digitalstores"] },
  { key: "mode-beaute", label: "Mode & Beauté", sites: ["jouanecain", "baneskincare", "universcosmetix"] },
  { key: "coran-xassida", label: "Coran & Xassida", sites: ["imanstore"] },
]

function ScrapeGroupButton({ label, sites }: { label: string; sites: string[] }) {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ created: number; updated: number; errors: string[] } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleClick = async () => {
    setIsLoading(true)
    setResult(null)
    setError(null)

    const response = await adminService.scrapeSync(sites)

    if (response.success && response.data) {
      setResult(response.data)
    } else {
      setError((response as { message?: string }).message || "Échec du scraping")
    }

    setIsLoading(false)
  }

  return (
    <div className="space-y-2">
      <Button onClick={handleClick} disabled={isLoading} variant="secondary" className="gap-2">
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
        Scraper {label}
      </Button>

      {result && (
        <ResultBanner>
          <p className="font-medium">Scraping terminé</p>
          <p className="text-muted-foreground">
            {result.created} annonce(s) créée(s), {result.updated} mise(s) à jour.
          </p>
          {result.errors.length > 0 && <p className="text-destructive mt-1">{result.errors.join(" · ")}</p>}
        </ResultBanner>
      )}
      {error && <ErrorBanner message={error} />}
    </div>
  )
}

export default function AdminTexpressPage() {
  const [texpressLoading, setTexpressLoading] = useState(false)
  const [texpressResult, setTexpressResult] = useState<{ created: number; updated: number; products_found: number } | null>(null)
  const [texpressError, setTexpressError] = useState<string | null>(null)

  const [jobsLoading, setJobsLoading] = useState(false)
  const [jobsResult, setJobsResult] = useState<{ created: number; updated: number; errors: string[] } | null>(null)
  const [jobsError, setJobsError] = useState<string | null>(null)

  const [realEstateLoading, setRealEstateLoading] = useState(false)
  const [realEstateResult, setRealEstateResult] = useState<{ created: number; updated: number; errors: string[] } | null>(null)
  const [realEstateError, setRealEstateError] = useState<string | null>(null)

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

  const handleJobSync = async () => {
    setJobsLoading(true)
    setJobsResult(null)
    setJobsError(null)

    const response = await adminService.syncJobs()

    if (response.success && response.data) {
      setJobsResult(response.data)
    } else {
      setJobsError((response as { message?: string }).message || "Échec de l'import")
    }

    setJobsLoading(false)
  }

  const handleRealEstateSync = async () => {
    setRealEstateLoading(true)
    setRealEstateResult(null)
    setRealEstateError(null)

    const response = await adminService.syncRealEstate()

    if (response.success && response.data) {
      setRealEstateResult(response.data)
    } else {
      setRealEstateError((response as { message?: string }).message || "Échec de l'import")
    }

    setRealEstateLoading(false)
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
                Importe des produits en stock depuis des sites e-commerce partenaires, un bouton par catégorie. Chaque
                annonce garde un lien interne vers la fiche produit d'origine, visible uniquement par toi dans la
                conversation liée — jamais envoyé au client — pour passer la commande et organiser la livraison.
              </p>

              <div className="flex flex-wrap gap-4">
                {SCRAPE_GROUPS.map((group) => (
                  <ScrapeGroupButton key={group.key} label={group.label} sites={group.sites} />
                ))}
              </div>
            </div>

            <div className="space-y-4 border-t pt-6">
              <h2 className="text-base font-semibold">Offres d'emploi</h2>
              <p className="text-sm text-muted-foreground">
                Importe des offres d'emploi depuis des sites partenaires (Wiijob, Offre-Emploi.sn, Humanis Intérim).
                Contrairement aux produits, le lien vers l'offre d'origine est affiché publiquement sur l'annonce
                (bouton "Postuler") — pas de messagerie, c'est un pur agrégateur.
              </p>

              <Button onClick={handleJobSync} disabled={jobsLoading} variant="secondary" className="gap-2">
                {jobsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Briefcase className="w-4 h-4" />}
                Récupérer les offres d'emploi
              </Button>

              {jobsResult && (
                <ResultBanner>
                  <p className="font-medium">Import terminé</p>
                  <p className="text-muted-foreground">
                    {jobsResult.created} offre(s) créée(s), {jobsResult.updated} mise(s) à jour.
                  </p>
                  {jobsResult.errors.length > 0 && (
                    <p className="text-destructive mt-1">{jobsResult.errors.join(" · ")}</p>
                  )}
                </ResultBanner>
              )}
              {jobsError && <ErrorBanner message={jobsError} />}
            </div>

            <div className="space-y-4 border-t pt-6">
              <h2 className="text-base font-semibold">Immobilier</h2>
              <p className="text-sm text-muted-foreground">
                Importe des biens depuis des agences partenaires (2S Immobilier). Comme pour l'emploi, le lien vers
                l'annonce d'origine est public (bouton "Voir l'annonce sur le site") — pas de messagerie, impossible
                de livrer un bien immobilier. Contrairement à l'emploi, le prix reste affiché.
              </p>

              <Button onClick={handleRealEstateSync} disabled={realEstateLoading} variant="secondary" className="gap-2">
                {realEstateLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Home className="w-4 h-4" />}
                Récupérer les biens immobiliers
              </Button>

              {realEstateResult && (
                <ResultBanner>
                  <p className="font-medium">Import terminé</p>
                  <p className="text-muted-foreground">
                    {realEstateResult.created} bien(s) créé(s), {realEstateResult.updated} mise(s) à jour.
                  </p>
                  {realEstateResult.errors.length > 0 && (
                    <p className="text-destructive mt-1">{realEstateResult.errors.join(" · ")}</p>
                  )}
                </ResultBanner>
              )}
              {realEstateError && <ErrorBanner message={realEstateError} />}
            </div>
          </div>
        </AdminLayout>
      </main>
      <BottomNav />
    </div>
  )
}
