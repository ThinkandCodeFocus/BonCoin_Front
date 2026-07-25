"use client"

import { useEffect, useRef, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download, Share2, Loader2 } from "lucide-react"
import { drawBusinessCard, canvasToFile } from "@/lib/business-card"

interface BusinessCardDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  subtitle: string
  imageUrl?: string
  url: string
  fileName?: string
}

export function BusinessCardDialog({
  open,
  onOpenChange,
  title,
  subtitle,
  imageUrl,
  url,
  fileName = "carte-de-visite.png",
}: BusinessCardDialogProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isGenerating, setIsGenerating] = useState(true)

  useEffect(() => {
    if (!open) return
    setIsGenerating(true)
    const canvas = canvasRef.current
    if (!canvas) return
    drawBusinessCard(canvas, { title, subtitle, imageUrl, url }).finally(() => setIsGenerating(false))
  }, [open, title, subtitle, imageUrl, url])

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement("a")
    link.download = fileName
    link.href = canvas.toDataURL("image/png")
    link.click()
  }

  const handleShare = async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    try {
      const file = await canvasToFile(canvas, fileName)
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title, text: `${title} — ${subtitle}` })
        return
      }
    } catch {
      // l'utilisateur a peut-être annulé le partage, ou l'API n'est pas dispo
    }

    // Repli : WhatsApp Web/app avec le lien (le partage de fichier n'est pas
    // possible via une simple URL wa.me, seul le texte l'est).
    const text = encodeURIComponent(`${title} — ${subtitle}\n${url}`)
    window.open(`https://wa.me/?text=${text}`, "_blank")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Carte de visite</DialogTitle>
          <DialogDescription>
            Téléchargez ou partagez cette carte — le QR code renvoie directement ici.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center bg-muted rounded-md p-2 relative">
          {isGenerating && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          )}
          <canvas ref={canvasRef} className="w-full max-w-[300px] h-auto border rounded-sm" />
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={handleDownload} disabled={isGenerating}>
            <Download className="w-4 h-4 mr-2" />
            Télécharger
          </Button>
          <Button className="flex-1" onClick={handleShare} disabled={isGenerating}>
            <Share2 className="w-4 h-4 mr-2" />
            Partager
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
