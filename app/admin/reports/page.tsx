"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { AdminLayout } from "@/components/admin-layout"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { adminService } from "@/lib/api"
import { toast } from "sonner"
import { EmptyState } from "@/components/design-system"

interface Report {
  id: number
  reportable_type: string
  reportable_id: number
  reason: string
  description: string | null
  status: "pending" | "reviewed" | "resolved" | "dismissed"
  admin_notes: string | null
  created_at: string
  reporter?: { id: number; name: string }
}

const statusLabels: Record<Report["status"], string> = {
  pending: "En attente",
  reviewed: "Examiné",
  resolved: "Résolu",
  dismissed: "Rejeté",
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [actingId, setActingId] = useState<number | null>(null)

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    setIsLoading(true)
    const result = await adminService.getReports()
    if (result.success && Array.isArray(result.data)) {
      setReports(result.data)
    }
    setIsLoading(false)
  }

  const handleReview = async (id: number, status: "resolved" | "dismissed") => {
    setActingId(id)
    const result = await adminService.reviewReport(id, { status })
    if (result.success) {
      toast.success("Signalement traité")
      await loadReports()
    } else {
      toast.error((result as any).message || "Erreur")
    }
    setActingId(null)
  }

  const formatDate = (dateString: string) =>
    new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" }).format(new Date(dateString))

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pb-16 md:pb-4">
        <AdminLayout>
          <div className="space-y-4">
            <h1 className="text-base font-semibold">Signalements</h1>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : reports.length === 0 ? (
              <EmptyState title="Aucun signalement" />
            ) : (
              <div className="space-y-3">
                {reports.map((report) => (
                  <Card key={report.id} className="p-4">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline">{report.reportable_type}</Badge>
                          <Badge variant={report.status === "pending" ? "secondary" : "outline"}>
                            {statusLabels[report.status]}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium">{report.reason}</p>
                        {report.description && (
                          <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          Signalé par {report.reporter?.name || "Utilisateur inconnu"} · {formatDate(report.created_at)}
                        </p>
                      </div>
                      {report.status === "pending" && (
                        <div className="flex gap-2 shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReview(report.id, "dismissed")}
                            disabled={actingId === report.id}
                          >
                            Rejeter
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleReview(report.id, "resolved")}
                            disabled={actingId === report.id}
                          >
                            Résoudre
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
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
