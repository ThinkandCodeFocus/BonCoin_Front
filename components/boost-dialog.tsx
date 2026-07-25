"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, Rocket } from "lucide-react"
import { boostService } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { formatPrice } from "@/components/design-system"

interface BoostPlan {
  duration_days: number
  amount: number
}

interface BoostDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  annonceId: number
  annonceTitle: string
}

export function BoostDialog({ open, onOpenChange, annonceId, annonceTitle }: BoostDialogProps) {
  const { toast } = useToast()
  const [plans, setPlans] = useState<BoostPlan[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isBoosting, setIsBoosting] = useState(false)

  useEffect(() => {
    if (!open) return
    setIsLoading(true)
    setSelected(null)
    boostService.getPlans().then((result) => {
      if (result.success && Array.isArray(result.data)) {
        setPlans(result.data)
        if (result.data.length > 0) setSelected(result.data[0].duration_days)
      }
      setIsLoading(false)
    })
  }, [open])

  const handleBoost = async () => {
    if (!selected) return
    setIsBoosting(true)
    const result = await boostService.boostAnnonce(annonceId, selected)
    setIsBoosting(false)

    if (result.success && result.data?.checkout_url) {
      window.location.href = result.data.checkout_url
      return
    }

    toast({
      title: "Paiement indisponible",
      description: result.data?.detail || result.message || "Le circuit de paiement n'est pas encore actif.",
      variant: "destructive",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Booster "{annonceTitle}"</DialogTitle>
          <DialogDescription>
            Mettez votre annonce en avant pendant la durée choisie. Paiement via Wave.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-2">
            {plans.map((plan) => (
              <button
                key={plan.duration_days}
                type="button"
                onClick={() => setSelected(plan.duration_days)}
                className={`w-full flex items-center justify-between border rounded-md px-4 py-3 text-sm text-left ${
                  selected === plan.duration_days ? "border-primary bg-primary/5" : ""
                }`}
              >
                <span>{plan.duration_days} jours</span>
                <span className="font-semibold">{formatPrice(plan.amount)}</span>
              </button>
            ))}
          </div>
        )}

        <Button onClick={handleBoost} disabled={isLoading || isBoosting || !selected} className="w-full">
          {isBoosting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Rocket className="w-4 h-4 mr-2" />}
          Payer avec Wave
        </Button>
      </DialogContent>
    </Dialog>
  )
}
