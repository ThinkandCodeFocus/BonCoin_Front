"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, X, Loader2, Mic, StopCircle, Type } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { annonceService, categoryService } from "@/lib/api"
import { useRouter } from "next/navigation"
import { Checkbox } from "@/components/ui/checkbox"

interface Category {
  id: number
  name: string
  icon?: string
}

export default function PublishPage() {
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const { toast } = useToast()
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [negotiable, setNegotiable] = useState(false)
  const [categoryId, setCategoryId] = useState("")
  const [customCategory, setCustomCategory] = useState("")
  const [city, setCity] = useState("")
  const [district, setDistrict] = useState("")
  const [etat, setEtat] = useState("")
  
  // Voice recording state
  const [descriptionMode, setDescriptionMode] = useState<'text' | 'voice'>('text')
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const [recordingInterval, setRecordingInterval] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour publier une annonce",
        variant: "destructive",
      })
      router.push("/")
      return
    }
    
    loadCategories()
  }, [isAuthenticated])

  const loadCategories = async () => {
    try {
      const result = await categoryService.getAll()
      console.log('API result:', result)
      
      if (result.success && result.data) {
        // Les catégories sont dans result.data.data (ResourceCollection wrapper)
        let categoriesData = result.data.data || result.data
        
        // Si c'est encore un objet avec data, extraire
        if (categoriesData.data && Array.isArray(categoriesData.data)) {
          categoriesData = categoriesData.data
        }
        
        // S'assurer que c'est un tableau
        if (!Array.isArray(categoriesData)) {
          categoriesData = []
        }
        
        console.log('Categories loaded:', categoriesData)
        setCategories(categoriesData)
      } else {
        console.error('Failed to load categories:', result)
        toast({
          title: "Erreur",
          description: "Impossible de charger les catégories",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error loading categories:', error)
      toast({
        title: "Erreur",
        description: "Erreur lors du chargement des catégories",
        variant: "destructive",
      })
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newFiles = Array.from(files).slice(0, 5 - imageFiles.length)
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file))
      
      setImageFiles([...imageFiles, ...newFiles])
      setImagePreviews([...imagePreviews, ...newPreviews])
    }
  }

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index])
    setImageFiles(imageFiles.filter((_, i) => i !== index))
    setImagePreviews(imagePreviews.filter((_, i) => i !== index))
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const chunks: BlobPart[] = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data)
        }
      }

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' })
        setAudioBlob(blob)
        stream.getTracks().forEach(track => track.stop())
      }

      recorder.start()
      setMediaRecorder(recorder)
      setIsRecording(true)
      setRecordingTime(0)

      // Démarrer le compteur
      const interval = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
      setRecordingInterval(interval)

      toast({
        title: "Enregistrement démarré",
        description: "Parlez maintenant pour décrire votre annonce",
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'accéder au microphone",
        variant: "destructive",
      })
    }
  }

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop()
      setIsRecording(false)
      if (recordingInterval) {
        clearInterval(recordingInterval)
        setRecordingInterval(null)
      }
      toast({
        title: "Enregistrement terminé",
        description: `Durée: ${recordingTime}s`,
      })
    }
  }

  const deleteRecording = () => {
    setAudioBlob(null)
    setRecordingTime(0)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Vérifier si Autre est sélectionné et que le champ personnalisé est vide
    const selectedCategory = categories.find(c => c.id.toString() === categoryId)
    const isAutreCategory = selectedCategory?.name === "Autre" || selectedCategory?.name === "Yeneen"
    
    if (!title || !price || !categoryId || !city || !district || !etat) {
      toast({
        title: "Champs manquants",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      })
      return
    }
    
    if (isAutreCategory && !customCategory.trim()) {
      toast({
        title: "Catégorie manquante",
        description: "Veuillez préciser la catégorie",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Créer l'annonce
      const annonceData = {
        title,
        description: descriptionMode === 'text' ? (description || 'Pas de description') : (audioBlob ? 'Description vocale enregistrée - Écoutez l\'audio pour plus de détails' : 'Pas de description'),
        price: parseFloat(price),
        negotiable,
        category_id: parseInt(categoryId),
        custom_category: isAutreCategory ? customCategory : null,
        city,
        district,
        etat,
      }

      console.log('Creating annonce with data:', annonceData)
      const result = await annonceService.create(annonceData)
      console.log('Create result:', result)
      
      if (!result.success) {
        const errorMessage = result.errors 
          ? Object.entries(result.errors).map(([field, messages]) => {
              return `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`
            }).join('\n')
          : result.message || "Erreur lors de la création"
        
        console.error('Creation error:', errorMessage)
        toast({
          title: "Erreur de création",
          description: errorMessage,
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      const annonceId = result.data.data?.id || result.data.id
      console.log('Annonce created with ID:', annonceId)

      // Upload des photos si présentes
      if (imageFiles.length > 0 && annonceId) {
        console.log('Uploading', imageFiles.length, 'photos...')
        const uploadResult = await annonceService.uploadPhotos(annonceId, imageFiles)
        console.log('Photos upload result:', uploadResult)
        
        if (!uploadResult.success) {
          toast({
            title: "Avertissement",
            description: "Annonce créée mais erreur lors de l'upload des photos: " + (uploadResult.message || 'Erreur inconnue'),
            variant: "destructive",
          })
        } else {
          console.log('Photos uploaded successfully')
        }
      }

      // Upload de l'audio vocal si présent
      if (audioBlob && annonceId) {
        const audioFile = new File([audioBlob], `description_${annonceId}.webm`, { type: 'audio/webm' })
        const formData = new FormData()
        formData.append('audio', audioFile)
        
        try {
          // Pour l'instant, on stocke juste l'audio. 
          // Plus tard, on pourra ajouter une API de transcription (speech-to-text)
          const audioUploadResult = await annonceService.uploadAudio(annonceId, formData)
          
          if (!audioUploadResult.success) {
            toast({
              title: "Avertissement",
              description: "Annonce créée mais erreur lors de l'upload de l'audio",
              variant: "destructive",
            })
          }
        } catch (error) {
          console.error("Erreur upload audio:", error)
        }
      }

      toast({
        title: "Annonce publiée",
        description: "Votre annonce est maintenant en ligne",
      })

      router.push(`/listings/${annonceId}`)
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la publication",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
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
                  {imagePreviews.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden">
                      <img src={img} alt="" className="w-full h-full object-cover" />
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
                  {imageFiles.length < 5 && (
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
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger id="category" className="mt-2">
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground">Chargement...</div>
                    ) : (
                      categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          {cat.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Custom Category - Shown only when Autre is selected */}
              {categoryId && categories.find(c => c.id.toString() === categoryId)?.name === "Autre" && (
                <div>
                  <Label htmlFor="customCategory">Précisez la catégorie *</Label>
                  <Input
                    id="customCategory"
                    placeholder="Ex: Bijoux, Art, Sport..."
                    required
                    className="mt-2"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                  />
                </div>
              )}

              {/* Title */}
              <div>
                <Label htmlFor="title">Titre de l'annonce * (10-100 caractères)</Label>
                <Input
                  id="title"
                  placeholder="Ex: iPhone 14 Pro Max en excellent état"
                  required
                  className="mt-2"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  minLength={10}
                  maxLength={100}
                />
              </div>

              {/* Description */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="description">Description (optionnel)</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={descriptionMode === 'text' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setDescriptionMode('text')}
                    >
                      <Type className="w-4 h-4 mr-2" />
                      Texte
                    </Button>
                    <Button
                      type="button"
                      variant={descriptionMode === 'voice' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setDescriptionMode('voice')}
                    >
                      <Mic className="w-4 h-4 mr-2" />
                      Vocal
                    </Button>
                  </div>
                </div>

                {descriptionMode === 'text' ? (
                  <Textarea
                    id="description"
                    placeholder="Décrivez votre article en détail... (optionnel)"
                    rows={6}
                    className="mt-2"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                ) : (
                  <div className="mt-2 p-4 border rounded-lg">
                    {!audioBlob ? (
                      <div className="flex flex-col items-center justify-center py-8">
                        {!isRecording ? (
                          <>
                            <Button
                              type="button"
                              onClick={startRecording}
                              className="w-20 h-20 rounded-full"
                            >
                              <Mic className="w-8 h-8" />
                            </Button>
                            <p className="text-sm text-muted-foreground mt-4">
                              Cliquez pour enregistrer votre description
                            </p>
                          </>
                        ) : (
                          <>
                            <Button
                              type="button"
                              onClick={stopRecording}
                              variant="destructive"
                              className="w-20 h-20 rounded-full animate-pulse"
                            >
                              <StopCircle className="w-8 h-8" />
                            </Button>
                            <p className="text-sm text-muted-foreground mt-4">
                              Enregistrement en cours... {formatTime(recordingTime)}
                            </p>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                              <Mic className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">Audio enregistré</p>
                              <p className="text-sm text-muted-foreground">
                                Durée: {formatTime(recordingTime)}
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={deleteRecording}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        <audio 
                          controls 
                          className="w-full" 
                          src={audioBlob ? URL.createObjectURL(audioBlob) : undefined}
                        >
                          Votre navigateur ne supporte pas la lecture audio.
                        </audio>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Price */}
              <div>
                <Label htmlFor="price">Prix (FCFA) *</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="Ex: 450000"
                  required
                  className="mt-2"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  min="0"
                />
                <div className="flex items-center space-x-2 mt-2">
                  <Checkbox
                    id="negotiable"
                    checked={negotiable}
                    onCheckedChange={(checked) => setNegotiable(checked as boolean)}
                  />
                  <label
                    htmlFor="negotiable"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Prix négociable
                  </label>
                </div>
              </div>

              {/* Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">Ville *</Label>
                  <Input
                    id="city"
                    placeholder="Ex: Dakar"
                    required
                    className="mt-2"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="district">Quartier *</Label>
                  <Input
                    id="district"
                    placeholder="Ex: Plateau"
                    required
                    className="mt-2"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                  />
                </div>
              </div>

              {/* Condition */}
              <div>
                <Label htmlFor="condition">État *</Label>
                <Select required value={etat} onValueChange={setEtat}>
                  <SelectTrigger id="condition" className="mt-2">
                    <SelectValue placeholder="Sélectionner l'état" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Neuf">Neuf</SelectItem>
                    <SelectItem value="Bon état">Bon état</SelectItem>
                    <SelectItem value="Usagé">Usagé</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Publication...
                  </>
                ) : (
                  "Publier l'annonce"
                )}
              </Button>
            </Card>
          </form>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
