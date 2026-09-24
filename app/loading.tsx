import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background" role="status" aria-label="Chargement">
      <Loader2 className="w-6 h-6 animate-spin text-primary" aria-hidden="true" />
    </div>
  )
}
