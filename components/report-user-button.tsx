"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { AlertTriangle, Flag, Loader2 } from "lucide-react"
import { reportService } from "@/lib/api"
import { toast } from "sonner"

interface ReportUserButtonProps {
  userId: number
  userName?: string
  trigger?: React.ReactNode
  onReport?: () => void
}

const reportReasons = [
  "Faux profil",
  "Harcelement",
  "Spam",
  "Contenu inapproprié",
  "Arnaque suspectée",
  "Autre raison",
]

export function ReportUserButton({ userId, userName, trigger, onReport }: ReportUserButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedReason, setSelectedReason] = useState("")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!selectedReason) {
      toast.error("Veuillez sélectionner une raison")
      return
    }

    setIsSubmitting(true)
    try {
      const result = await reportService.reportUser({
        user_id: userId,
        reason: selectedReason,
        description: description || null,
      })

      if (result.success) {
        toast.success("Signalement envoyé", {
          description: "Nous allons examiner ce signalement sous peu.",
        })
        setIsOpen(false)
        setSelectedReason("")
        setDescription("")
        onReport?.()
      } else {
        toast.error((result as any).message || "Erreur lors du signalement")
      }
    } catch (error) {
      toast.error("Erreur lors du signalement")
    } finally {
      setIsSubmitting(false)
    }
  }

  const defaultTrigger = (
    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
      <Flag className="w-4 h-4 mr-2" />
      Signaler
    </Button>
  )

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        {trigger || defaultTrigger}
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Signaler {userName ? `« ${userName} »` : "cet utilisateur"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Vous êtes sur le point de signaler cet utilisateur. Votre signalement sera examiné par notre équipe.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          {/* Raison du signalement */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Raison du signalement *</label>
            <div className="grid grid-cols-1 gap-2">
              {reportReasons.map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => setSelectedReason(reason)}
                  className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedReason === reason
                      ? "bg-destructive text-white"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>
          </div>

          {/* Description optionnelle */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Description (optionnelle)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Donnez plus de détails sur le problème..."
              className="w-full px-3 py-2 border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-destructive"
              rows={3}
            />
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSubmit}
            disabled={!selectedReason || isSubmitting}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Envoi...
              </>
            ) : (
              <>
                <Flag className="w-4 h-4 mr-2" />
                Signaler
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}


