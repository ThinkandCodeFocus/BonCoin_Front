"use client"

import { useState } from "react"
import { CheckCircle2, Loader2, ShieldAlert, ShieldCheck, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { transactionService } from "@/lib/api"
import { formatPrice } from "@/components/design-system"
import { PaymentDialog } from "@/components/payment-dialog"
import { toast } from "sonner"

export interface TransactionData {
  id: number
  status: "pending" | "held" | "confirmed" | "released" | "refunded" | "failed"
  amount: number
  dispute_status: "open" | "resolved_buyer" | "resolved_seller" | null
  dispute_reason: string | null
}

interface AnnonceSummary {
  id: number
  title: string
  price: number
  status: string
}

interface TransactionBannerProps {
  conversationId: number
  annonce: AnnonceSummary | null
  transaction: TransactionData | null
  isBuyer: boolean
  onUpdate: () => void
}

export function TransactionBanner({ conversationId, annonce, transaction, isBuyer, onUpdate }: TransactionBannerProps) {
  const [showPayDialog, setShowPayDialog] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showDisputeDialog, setShowDisputeDialog] = useState(false)
  const [disputeReason, setDisputeReason] = useState("")
  const [isActing, setIsActing] = useState(false)

  if (!annonce) return null

  const handleConfirmReceipt = async () => {
    if (!transaction) return
    setIsActing(true)
    const result = await transactionService.confirmReceipt(transaction.id)
    setIsActing(false)
    setShowConfirmDialog(false)
    if (result.success) {
      toast.success("Réception confirmée")
      onUpdate()
    } else {
      toast.error(result.message || "Erreur")
    }
  }

  const handleOpenDispute = async () => {
    if (!transaction || !disputeReason.trim()) return
    setIsActing(true)
    const result = await transactionService.openDispute(transaction.id, disputeReason.trim())
    setIsActing(false)
    if (result.success) {
      toast.success("Litige signalé, notre équipe va l'examiner")
      setShowDisputeDialog(false)
      setDisputeReason("")
      onUpdate()
    } else {
      toast.error(result.message || "Erreur")
    }
  }

  const canDispute = transaction && ["held", "confirmed"].includes(transaction.status) && !transaction.dispute_status

  const disputeButton = canDispute && (
    <Button variant="outline" size="sm" onClick={() => setShowDisputeDialog(true)}>
      Signaler un problème
    </Button>
  )

  const Wrapper = ({ tone, icon, children }: { tone: "neutral" | "amber" | "green"; icon: React.ReactNode; children: React.ReactNode }) => (
    <div
      className={`border-2 border-ink radius-indie-alt px-4 py-3 flex flex-wrap items-center gap-3 justify-between ${
        tone === "green" ? "bg-secondary text-secondary-foreground" : tone === "amber" ? "bg-primary/15" : "bg-card"
      }`}
    >
      <div className="flex items-center gap-2 text-sm">
        {icon}
        {children}
      </div>
    </div>
  )

  let content: React.ReactNode = null

  if (transaction?.dispute_status === "open") {
    content = (
      <Wrapper tone="amber" icon={<ShieldAlert className="w-4 h-4 shrink-0" />}>
        <span>
          Litige en cours d&apos;examen par notre équipe.
          {transaction.dispute_reason && <span className="block text-xs text-muted-foreground mt-0.5">« {transaction.dispute_reason} »</span>}
        </span>
      </Wrapper>
    )
  } else if (!transaction) {
    if (isBuyer && annonce.status === "Disponible") {
      content = (
        <Wrapper tone="neutral" icon={<Wallet className="w-4 h-4 shrink-0 text-primary" />}>
          <span className="font-medium">
            {annonce.title} ({formatPrice(annonce.price)})
          </span>
        </Wrapper>
      )
    }
  } else if (transaction.status === "pending") {
    content = (
      <Wrapper tone="neutral" icon={<Loader2 className="w-4 h-4 shrink-0 animate-spin" />}>
        Paiement en cours de traitement…
      </Wrapper>
    )
  } else if (transaction.status === "failed") {
    content = isBuyer ? (
      <Wrapper tone="neutral" icon={<Wallet className="w-4 h-4 shrink-0" />}>
        Le paiement a échoué. Vous pouvez réessayer.
      </Wrapper>
    ) : null
  } else if (transaction.status === "held") {
    content = isBuyer ? (
      <Wrapper tone="neutral" icon={<ShieldCheck className="w-4 h-4 shrink-0 text-primary" />}>
        Paiement reçu. Confirmez la réception de l&apos;article quand vous l&apos;avez bien reçu.
      </Wrapper>
    ) : (
      <Wrapper tone="neutral" icon={<ShieldCheck className="w-4 h-4 shrink-0 text-primary" />}>
        L&apos;acheteur a payé, en attente de sa confirmation de réception.
      </Wrapper>
    )
  } else if (transaction.status === "confirmed") {
    content = (
      <Wrapper tone="neutral" icon={<CheckCircle2 className="w-4 h-4 shrink-0 text-primary" />}>
        Réception confirmée. Versement au vendeur en cours de traitement par notre équipe.
      </Wrapper>
    )
  } else if (transaction.status === "released") {
    content = (
      <Wrapper tone="green" icon={<CheckCircle2 className="w-4 h-4 shrink-0" />}>
        Transaction terminée. Fonds versés au vendeur.
      </Wrapper>
    )
  } else if (transaction.status === "refunded") {
    content = (
      <Wrapper tone="neutral" icon={<CheckCircle2 className="w-4 h-4 shrink-0" />}>
        Litige résolu en faveur de l&apos;acheteur. Remboursement effectué.
      </Wrapper>
    )
  }

  const showPayButton = (!transaction || transaction.status === "failed") && isBuyer && annonce.status === "Disponible"
  const showConfirmRow = transaction?.status === "held" && isBuyer && !transaction.dispute_status
  const showSellerDispute = transaction?.status === "held" && !isBuyer && !!disputeButton

  if (!content && !showPayButton && !showConfirmRow && !showSellerDispute) return null

  return (
    <div className="px-4 py-3 border-b shrink-0 space-y-2">
      {content}
      {/* Paiement désactivé : en attente de l'intégration des API Wave / Orange Money.
          Décommenter une fois le circuit de paiement actif.
      {showPayButton && (
        <Button size="sm" onClick={() => setShowPayDialog(true)} className="gap-1.5">
          <Wallet className="w-3.5 h-3.5" />
          Payer maintenant
        </Button>
      )}
      */}
      {showConfirmRow && (
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => setShowConfirmDialog(true)}>
            J&apos;ai bien reçu l&apos;article
          </Button>
          {disputeButton}
        </div>
      )}
      {showSellerDispute && disputeButton}

      <PaymentDialog
        open={showPayDialog}
        onOpenChange={setShowPayDialog}
        conversationId={conversationId}
        annonceTitle={annonce.title}
        amount={annonce.price}
      />

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la réception ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action informe le vendeur que vous avez bien reçu l&apos;article. Le versement des fonds sera ensuite traité par notre équipe.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isActing}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmReceipt} disabled={isActing}>
              {isActing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Confirmer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showDisputeDialog} onOpenChange={setShowDisputeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Signaler un problème</DialogTitle>
            <DialogDescription>
              Décrivez le problème rencontré. Un administrateur va examiner la transaction.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={disputeReason}
            onChange={(e) => setDisputeReason(e.target.value)}
            placeholder="Ex : l'article reçu ne correspond pas à l'annonce…"
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDisputeDialog(false)} disabled={isActing}>
              Annuler
            </Button>
            <Button onClick={handleOpenDispute} disabled={isActing || !disputeReason.trim()}>
              {isActing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Envoyer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
