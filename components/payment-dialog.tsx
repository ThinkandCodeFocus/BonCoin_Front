"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, ShieldCheck } from "lucide-react"
import { transactionService } from "@/lib/api"
import { toast } from "sonner"
import { formatPrice } from "@/components/design-system"

interface PaymentMethodOption {
  value: string
  label: string
}

const PAYMENT_METHODS: PaymentMethodOption[] = [
  { value: "wave", label: "Wave" },
  { value: "orange_money", label: "Orange Money" },
  { value: "free_money", label: "Free Money" },
]

interface PaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  conversationId: number
  annonceTitle: string
  amount: number
}

export function PaymentDialog({ open, onOpenChange, conversationId, annonceTitle, amount }: PaymentDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState("wave")
  const [isPaying, setIsPaying] = useState(false)

  const handlePay = async () => {
    setIsPaying(true)
    const result = await transactionService.initiate(conversationId, paymentMethod)
    setIsPaying(false)

    if (result.success && result.data?.checkout_url) {
      window.location.href = result.data.checkout_url
      return
    }

    toast.error(result.data?.detail || result.message || "Le circuit de paiement n'est pas encore actif.")
  }

  const selectedMethodLabel = PAYMENT_METHODS.find((m) => m.value === paymentMethod)?.label || "Wave"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Payer "{annonceTitle}"</DialogTitle>
          <DialogDescription>
            Vos fonds sont conservés jusqu'à ce que vous confirmiez avoir bien reçu l'article.
          </DialogDescription>
        </DialogHeader>

        <div className="border-2 border-ink radius-indie-alt bg-muted px-4 py-3 flex items-center justify-between">
          <span className="text-sm font-medium">Montant à payer</span>
          <span className="font-display text-xl font-bold">{formatPrice(amount)}</span>
        </div>

        <div>
          <p className="text-sm font-medium mb-2">Moyen de paiement</p>
          <div className="grid grid-cols-3 gap-2">
            {PAYMENT_METHODS.map((method) => (
              <button
                key={method.value}
                type="button"
                onClick={() => setPaymentMethod(method.value)}
                className={`border rounded-md px-2 py-2 text-xs font-medium text-center ${
                  paymentMethod === method.value ? "border-primary bg-primary/5" : ""
                }`}
              >
                {method.label}
              </button>
            ))}
          </div>
        </div>

        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
          Paiement sécurisé, retenu jusqu'à confirmation de réception.
        </p>

        <Button onClick={handlePay} disabled={isPaying} className="w-full">
          {isPaying && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Payer avec {selectedMethodLabel}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
