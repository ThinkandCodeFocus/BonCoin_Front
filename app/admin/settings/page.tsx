"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Loader2, Megaphone } from "lucide-react"
import { adminService } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function AdminSettingsPage() {
  const [isRelaunching, setIsRelaunching] = useState(false)
  const { toast } = useToast()

  const relaunchBanner = async () => {
    setIsRelaunching(true)
    const result = await adminService.relaunchSignupBanner()
    setIsRelaunching(false)

    if (result.success) {
      toast({ title: "Bannière relancée", description: "Elle sera de nouveau affichée aux visiteurs." })
    } else {
      toast({ title: "Erreur", description: "Impossible de relancer la bannière.", variant: "destructive" })
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pb-16 md:pb-4">
        <AdminLayout>
          <div className="space-y-4">
            <h1 className="text-base font-semibold">Paramètres</h1>

            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h2 className="text-sm font-semibold">Bannière "Créer un compte"</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Affiche une fois, pendant 1 minute, un message invitant les visiteurs non connectés à créer un
                    compte. Une fois vue (ou fermée), elle ne réapparaît plus tant qu'elle n'est pas relancée
                    ici.
                  </p>
                </div>
              </div>
              <Button onClick={relaunchBanner} disabled={isRelaunching}>
                {isRelaunching ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Relance...
                  </>
                ) : (
                  "Relancer la bannière"
                )}
              </Button>
            </div>
          </div>
        </AdminLayout>
      </main>
      <BottomNav />
    </div>
  )
}
