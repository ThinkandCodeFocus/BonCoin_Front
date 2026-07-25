"use client"

import { useEffect, useState } from "react"
import { Star, Loader2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { reviewService } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { resolveStorageUrl } from "@/lib/media"

interface ReviewItem {
  id: number
  rating: number
  comment: string | null
  created_at: string
  reviewer: {
    id: number
    name: string
    photo?: string
  }
}

interface SellerReviewsProps {
  sellerId: number
}

export function SellerReviews({ sellerId }: SellerReviewsProps) {
  const { isAuthenticated, user } = useAuth()
  const { toast } = useToast()
  const [averageRating, setAverageRating] = useState<number | null>(null)
  const [reviewsCount, setReviewsCount] = useState(0)
  const [reviews, setReviews] = useState<ReviewItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadReviews = () => {
    setIsLoading(true)
    reviewService.getSellerReviews(sellerId).then((result) => {
      if (result.success && result.data) {
        setAverageRating(result.data.average_rating > 0 ? result.data.average_rating : null)
        setReviewsCount(result.data.reviews_count || 0)
        setReviews(result.data.reviews?.data || [])
      }
      setIsLoading(false)
    })
  }

  useEffect(() => {
    if (!sellerId) return
    loadReviews()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sellerId])

  const myReview = reviews.find((r) => r.reviewer.id === user?.id)

  const handleSubmit = async () => {
    if (rating < 1) {
      toast({ title: "Note requise", description: "Sélectionnez une note de 1 à 5 étoiles", variant: "destructive" })
      return
    }
    setIsSubmitting(true)
    const result = await reviewService.submitReview(sellerId, { rating, comment: comment.trim() || undefined })
    setIsSubmitting(false)
    if (result.success) {
      toast({ title: "Avis publié", description: "Merci pour votre retour" })
      setRating(0)
      setComment("")
      loadReviews()
    } else {
      toast({ title: "Erreur", description: result.message || "Impossible de publier l'avis", variant: "destructive" })
    }
  }

  const handleDelete = async (id: number) => {
    const result = await reviewService.deleteReview(id)
    if (result.success) {
      toast({ title: "Avis supprimé" })
      loadReviews()
    }
  }

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Chargement des avis...</p>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        {averageRating !== null ? (
          <>
            <Star className="w-4 h-4 fill-current text-primary" />
            <span className="font-semibold">{averageRating}</span>
            <span className="text-sm text-muted-foreground">
              ({reviewsCount} avis)
            </span>
          </>
        ) : (
          <span className="text-sm text-muted-foreground">Aucun avis pour ce vendeur</span>
        )}
      </div>

      {isAuthenticated && user?.id !== sellerId && (
        <div className="border rounded-lg p-4 space-y-3">
          <p className="text-sm font-medium">{myReview ? "Modifier votre avis" : "Laisser un avis"}</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                onMouseEnter={() => setHoverRating(value)}
                onMouseLeave={() => setHoverRating(0)}
                aria-label={`${value} étoile(s)`}
              >
                <Star
                  className={`w-5 h-5 ${
                    value <= (hoverRating || rating || myReview?.rating || 0)
                      ? "fill-current text-primary"
                      : "text-muted-foreground"
                  }`}
                />
              </button>
            ))}
          </div>
          <Textarea
            placeholder="Votre commentaire (facultatif)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
          />
          <Button size="sm" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Publier
          </Button>
        </div>
      )}

      {reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground">Ce vendeur n'a pas encore reçu d'avis.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border-b pb-4 last:border-b-0">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {review.reviewer.photo ? (
                    <img
                      src={resolveStorageUrl(review.reviewer.photo)}
                      alt=""
                      className="w-7 h-7 rounded-full object-cover"
                    />
                  ) : (
                    <span className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">
                      {review.reviewer.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                  <span className="text-sm font-medium">{review.reviewer.name}</span>
                  <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                    <Star className="w-3 h-3 fill-current" />
                    {review.rating}
                  </span>
                </div>
                {review.reviewer.id === user?.id && (
                  <button onClick={() => handleDelete(review.id)} aria-label="Supprimer votre avis">
                    <Trash2 className="w-4 h-4 text-muted-foreground" />
                  </button>
                )}
              </div>
              {review.comment && (
                <p className="text-sm text-muted-foreground mt-2">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
