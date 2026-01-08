"use client"

import type React from "react"

import { useState } from "react"
import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function PublishPage() {
  const [images, setImages] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newImages = Array.from(files).map((file) => URL.createObjectURL(file))
      setImages([...images, ...newImages].slice(0, 5))
    }
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Annonce publiée",
        description: "Votre annonce est maintenant en ligne.",
      })
    }, 1500)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pb-20 md:pb-4 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Déposer une annonce</h1>

          <form onSubmit={handleSubmit}>
            <Card className="p-6 space-y-6">
              {/* Images */}
              <div>
                <Label>Photos (max 5)</Label>
                <div className="mt-2 grid grid-cols-3 md:grid-cols-5 gap-4">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden">
                      <img src={img || "/placeholder.svg"} alt="" className="w-full h-full object-cover" />
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        className="absolute top-2 right-2 w-6 h-6"
                        onClick={() => removeImage(idx)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  {images.length < 5 && (
                    <label className="aspect-square rounded-lg border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
                      <Upload className="w-6 h-6 text-muted-foreground" />
                      <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                    </label>
                  )}
                </div>
              </div>

              {/* Category */}
              <div>
                <Label htmlFor="category">Catégorie *</Label>
                <Select required>
                  <SelectTrigger id="category" className="mt-2">
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="phones">Téléphones</SelectItem>
                    <SelectItem value="real-estate">Immobilier</SelectItem>
                    <SelectItem value="vehicles">Véhicules</SelectItem>
                    <SelectItem value="fashion">Mode</SelectItem>
                    <SelectItem value="home">Maison</SelectItem>
                    <SelectItem value="jobs">Emploi</SelectItem>
                    <SelectItem value="leisure">Loisirs</SelectItem>
                    <SelectItem value="other">Autres</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Title */}
              <div>
                <Label htmlFor="title">Titre de l'annonce *</Label>
                <Input id="title" placeholder="Ex: iPhone 14 Pro Max en excellent état" required className="mt-2" />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Décrivez votre article en détail..."
                  rows={6}
                  required
                  className="mt-2"
                />
              </div>

              {/* Price */}
              <div>
                <Label htmlFor="price">Prix (FCFA) *</Label>
                <Input id="price" type="number" placeholder="Ex: 450000" required className="mt-2" />
              </div>

              {/* Location */}
              <div>
                <Label htmlFor="location">Localisation *</Label>
                <Input id="location" placeholder="Ville, quartier" required className="mt-2" />
              </div>

              {/* Condition */}
              <div>
                <Label htmlFor="condition">État</Label>
                <Select>
                  <SelectTrigger id="condition" className="mt-2">
                    <SelectValue placeholder="Sélectionner l'état" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Neuf</SelectItem>
                    <SelectItem value="like-new">Comme neuf</SelectItem>
                    <SelectItem value="good">Bon état</SelectItem>
                    <SelectItem value="fair">État moyen</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? "Publication..." : "Publier l'annonce"}
              </Button>
            </Card>
          </form>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
