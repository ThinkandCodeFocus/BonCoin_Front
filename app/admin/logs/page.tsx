"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { AdminLayout } from "@/components/admin-layout"
import { Loader2 } from "lucide-react"
import { adminService } from "@/lib/api"
import { EmptyState } from "@/components/design-system"

interface AdminLog {
  id: number
  action: string
  details: string | null
  created_at: string
  admin?: { id: number; name: string }
  target_user?: { id: number; name: string } | null
}

const actionLabels: Record<string, string> = {
  suspend: "a suspendu",
  reactivate: "a réactivé",
  delete: "a supprimé",
  release_funds: "a versé les fonds pour",
  refund_buyer: "a remboursé",
  resolve_dispute_seller: "a résolu (en faveur du vendeur) le litige de",
  resolve_dispute_buyer: "a résolu (en faveur de l'acheteur) le litige de",
  texpress_sync: "a synchronisé les offres T-Express",
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<AdminLog[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    adminService.getLogs().then((result) => {
      if (result.success && result.data?.data) {
        setLogs(result.data.data)
      }
      setIsLoading(false)
    })
  }, [])

  const formatDate = (dateString: string) =>
    new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(
      new Date(dateString)
    )

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pb-16 md:pb-4">
        <AdminLayout>
          <div className="space-y-4">
            <h1 className="text-base font-semibold">Journal des actions</h1>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : logs.length === 0 ? (
              <EmptyState title="Aucune action enregistrée" />
            ) : (
              <div className="border rounded-lg divide-y">
                {logs.map((log) => (
                  <div key={log.id} className="p-3 text-sm">
                    <span className="font-medium">{log.admin?.name || "Admin"}</span>{" "}
                    {actionLabels[log.action] || log.action}{" "}
                    {log.action !== "texpress_sync" && (
                      <span className="font-medium">{log.target_user?.name || "un compte supprimé"}</span>
                    )}
                    {log.details && <p className="text-xs text-muted-foreground mt-1">{log.details}</p>}
                    <p className="text-xs text-muted-foreground mt-1">{formatDate(log.created_at)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </AdminLayout>
      </main>
      <BottomNav />
    </div>
  )
}
