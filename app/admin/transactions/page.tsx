"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { AdminLayout } from "@/components/admin-layout"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Loader2 } from "lucide-react"
import { adminService } from "@/lib/api"
import { toast } from "sonner"
import { EmptyState, formatPrice } from "@/components/design-system"

type TransactionStatus = "pending" | "held" | "confirmed" | "released" | "refunded" | "failed"
type DisputeStatus = "open" | "resolved_buyer" | "resolved_seller" | null

interface Transaction {
  id: number
  amount: number
  status: TransactionStatus
  dispute_status: DisputeStatus
  dispute_reason: string | null
  created_at: string
  user?: { id: number; name: string; phone?: string }
  seller?: { id: number; name: string; phone?: string }
  annonce?: { id: number; title: string; price: number }
}

const statusLabels: Record<TransactionStatus, string> = {
  pending: "En cours",
  held: "Retenu",
  confirmed: "Confirmé, en attente de versement",
  released: "Fonds versés",
  refunded: "Remboursé",
  failed: "Échoué",
}

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [actingId, setActingId] = useState<number | null>(null)
  const [confirmAction, setConfirmAction] = useState<{ id: number; type: "release" | "refund" } | null>(null)

  useEffect(() => {
    loadTransactions()
  }, [])

  const loadTransactions = async () => {
    setIsLoading(true)
    const result = await adminService.getTransactions()
    if (result.success && Array.isArray(result.data)) {
      setTransactions(result.data)
    }
    setIsLoading(false)
  }

  const handleResolveDispute = async (id: number, resolution: "buyer" | "seller") => {
    setActingId(id)
    const result = await adminService.resolveDispute(id, resolution)
    if (result.success) {
      toast.success("Litige résolu")
      await loadTransactions()
    } else {
      toast.error((result as any).message || "Erreur")
    }
    setActingId(null)
  }

  const handleConfirmAction = async () => {
    if (!confirmAction) return
    const { id, type } = confirmAction
    setActingId(id)
    setConfirmAction(null)
    const result = type === "release" ? await adminService.releaseFunds(id) : await adminService.refundBuyer(id)
    if (result.success) {
      toast.success(type === "release" ? "Fonds versés enregistrés" : "Remboursement enregistré")
      await loadTransactions()
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
            <h1 className="text-base font-semibold">Transactions</h1>
            <p className="text-xs text-muted-foreground">
              Aucun versement automatique n&apos;est effectué : envoyez l&apos;argent au vendeur via Wave/Orange Money/Free Money vous-même, puis enregistrez l&apos;action ici.
            </p>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : transactions.length === 0 ? (
              <EmptyState title="Aucune transaction" />
            ) : (
              <div className="space-y-3">
                {transactions.map((tx) => {
                  const isDisputeOpen = tx.dispute_status === "open"
                  const canRelease = tx.status === "confirmed" && tx.dispute_status !== "open" && tx.dispute_status !== "resolved_buyer"
                  const canRefund = tx.dispute_status === "resolved_buyer" && tx.status !== "refunded"

                  return (
                    <Card key={tx.id} className="p-4">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <Badge variant={isDisputeOpen ? "destructive" : "outline"}>{statusLabels[tx.status]}</Badge>
                            {tx.dispute_status && (
                              <Badge variant={isDisputeOpen ? "destructive" : "secondary"}>
                                Litige : {tx.dispute_status === "open" ? "ouvert" : tx.dispute_status === "resolved_buyer" ? "résolu (acheteur)" : "résolu (vendeur)"}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm font-medium">
                            {tx.annonce?.title} ({formatPrice(tx.amount)})
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Acheteur : {tx.user?.name || "?"} ({tx.user?.phone || "tél. non renseigné"}) · Vendeur : {tx.seller?.name || "?"} ({tx.seller?.phone || "tél. non renseigné"})
                          </p>
                          {tx.dispute_reason && (
                            <p className="text-xs text-muted-foreground mt-1">Motif : {tx.dispute_reason}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">{formatDate(tx.created_at)}</p>
                        </div>

                        <div className="flex gap-2 shrink-0 flex-wrap">
                          {isDisputeOpen && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleResolveDispute(tx.id, "buyer")}
                                disabled={actingId === tx.id}
                              >
                                Résoudre (acheteur)
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleResolveDispute(tx.id, "seller")}
                                disabled={actingId === tx.id}
                              >
                                Résoudre (vendeur)
                              </Button>
                            </>
                          )}
                          {canRelease && (
                            <Button
                              size="sm"
                              onClick={() => setConfirmAction({ id: tx.id, type: "release" })}
                              disabled={actingId === tx.id}
                            >
                              Fonds versés
                            </Button>
                          )}
                          {canRefund && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setConfirmAction({ id: tx.id, type: "refund" })}
                              disabled={actingId === tx.id}
                            >
                              Remboursement effectué
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </AdminLayout>
      </main>

      <AlertDialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.type === "release" ? "Confirmer le versement des fonds ?" : "Confirmer le remboursement ?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Cette action enregistre que vous avez envoyé l&apos;argent manuellement (Wave/Orange Money/Free Money). Elle ne déclenche aucun virement automatique et ne peut pas être annulée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAction}>Confirmer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BottomNav />
    </div>
  )
}
