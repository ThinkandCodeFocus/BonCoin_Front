"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react"
import { adminService } from "@/lib/api"

export default function AdminTexpressPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ created: number; updated: number; products_found: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSync = async () => {
    setIsLoading(true)
    setResult(null)
    setError(null)

    const response = await adminService.syncTexpress()

    if (response.success && response.data) {
      setResult(response.data)
    } else {
      setError((response as { message?: string }).message || "Échec de la synchronisation")
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pb-16 md:pb-4">
        <AdminLayout>
          <div className="space-y-4">
            <h1 className="text-base font-semibold">Import T-Express</h1>
            <p className="text-sm text-muted-foreground">
              Récupère les produits actifs de T-Express et les publie comme annonces (avec une marge appliquée sur
              le prix). Les annonces déjà importées sont mises à jour, pas dupliquées.
            </p>

            <Button onClick={handleSync} disabled={isLoading} className="gap-2">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Récupérer les offres T-Express
            </Button>

            {result && (
              <div className="flex items-start gap-2 border rounded-lg p-3 text-sm bg-muted/30">
                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">Synchronisation terminée</p>
                  <p className="text-muted-foreground">
                    {result.products_found} produit(s) trouvé(s) — {result.created} annonce(s) créée(s),{" "}
                    {result.updated} mise(s) à jour.
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 border border-destructive/30 rounded-lg p-3 text-sm bg-destructive/5">
                <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                <p className="text-destructive">{error}</p>
              </div>
            )}
          </div>
        </AdminLayout>
      </main>
      <BottomNav />
    </div>
  )
}
