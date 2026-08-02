"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, X, Loader2, Mic, StopCircle, Type, Video } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useI18n } from "@/components/I18nProvider"
import { useAuth } from "@/contexts/AuthContext"
import { annonceService, categoryService } from "@/lib/api"
import { resolveStorageUrl } from "@/lib/media"
import { useRouter, useSearchParams } from "next/navigation"
import { Checkbox } from "@/components/ui/checkbox"
import { getCityCoordinates } from "@/lib/geolocation"
import { convertHeicIfNeeded } from "@/lib/image"
import { CategoryAttributeFields } from "@/components/category-attribute-fields"
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
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useI18n()

  const editId = searchParams.get("edit")
  const isEditMode = !!editId
  const [isLoadingExisting, setIsLoadingExisting] = useState(isEditMode)
  const [existingPhotoUrls, setExistingPhotoUrls] = useState<string[]>([])

  // Form state
  const [showPublishConfirm, setShowPublishConfirm] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [negotiable, setNegotiable] = useState(false)
  const [whatsappContact, setWhatsappContact] = useState(true)
  const [categoryId, setCategoryId] = useState("")
  const [customCategory, setCustomCategory] = useState("")
  const [categoryAttributes, setCategoryAttributes] = useState<Record<string, string>>({})
  const [city, setCity] = useState("")
  const [district, setDistrict] = useState("")
  const [etat, setEtat] = useState("")
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  
  // Voice recording state
  const [descriptionMode, setDescriptionMode] = useState<'text' | 'voice'>('text')
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const [recordingInterval, setRecordingInterval] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth")
      return
    }

    if (user?.user_type === "buyer") {
      toast({
        title: t("publish.buyer_account_title"),
        description: t("publish.buyer_account_desc"),
        variant: "destructive",
      })
      router.push("/")
      return
    }

    loadCategories()
  }, [isAuthenticated, user])

  useEffect(() => {
    if (!editId) return

    const loadExisting = async () => {
      setIsLoadingExisting(true)
      const result = await annonceService.getById(Number(editId))
      const annonce = (result as any).data?.data || (result as any).data

      if (!result.success || !annonce) {
        toast({
          title: t("toast.error") || "Erreur",
          description: t("publish.load_error"),
          variant: "destructive",
        })
        router.push("/profile?tab=listings")
        return
      }

      setTitle(annonce.title || "")
      setDescription(annonce.description || "")
      setPrice(annonce.price !== undefined ? String(annonce.price) : "")
      setNegotiable(!!annonce.negotiable)
      setWhatsappContact(annonce.whatsapp_contact ?? true)
      setCategoryId(annonce.category?.id ? String(annonce.category.id) : "")
      setCustomCategory(annonce.custom_category || "")
      setCity(annonce.city || "")
      setDistrict(annonce.district || "")
      setEtat(annonce.etat || "")
      setExistingPhotoUrls(annonce.photos || [])

      if (Array.isArray(annonce.attributes)) {
        const attrs: Record<string, string> = {}
        for (const a of annonce.attributes) {
          if (a?.key) attrs[a.key] = a.value ?? ""
        }
        setCategoryAttributes(attrs)
      }

      setIsLoadingExisting(false)
    }

    loadExisting()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId])

  // Retour depuis la prévisualisation ("Modifier") : on recharge le
  // brouillon au lieu de repartir d'un formulaire vide.
  useEffect(() => {
    if (editId) return

    const raw = sessionStorage.getItem("preview_annonce")
    if (!raw) return

    try {
      const data = JSON.parse(raw)
      const draft = (window as any).__publishDraft

      setTitle(data.title || "")
      setDescription(data.description || "")
      setPrice(data.price || "")
      setNegotiable(!!data.negotiable)
      setCategoryId(data.categoryId || "")
      setCustomCategory(data.customCategory || "")
      setCity(data.city || "")
      setDistrict(data.district || "")
      setEtat(data.etat || "")
      setCategoryAttributes(data.attributes || {})

      if (draft?.descriptionMode) setDescriptionMode(draft.descriptionMode)

      if (draft?.imageFiles?.length) {
        setImageFiles(draft.imageFiles)
        setImagePreviews(draft.imageFiles.map((file: File) => URL.createObjectURL(file)))
      }
      if (draft?.videoFile) {
        setVideoFile(draft.videoFile)
        setVideoPreview(URL.createObjectURL(draft.videoFile))
      }
      if (draft?.audioBlob) {
        setAudioBlob(draft.audioBlob)
      }
    } catch {
      // Brouillon corrompu ou illisible : on ignore, le formulaire reste vide.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId])

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
          title: t("toast.error") || "Erreur",
          description: t("publish.load_categories_error") || "Impossible de charger les catégories",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error loading categories:', error)
      toast({
        title: t("toast.error") || "Erreur",
        description: t("publish.load_categories_exception") || "Erreur lors du chargement des catégories",
        variant: "destructive",
      })
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const remainingSlots = Math.max(0, 5 - existingPhotoUrls.length - imageFiles.length)
    const selectedFiles = Array.from(files).slice(0, remainingSlots)

    if (selectedFiles.length === 0) {
      toast({
        title: t("toast.error") || "Erreur",
        description: t("publish.max_photos_reached"),
        variant: "destructive",
      })
      e.target.value = ""
      return
    }

    if (selectedFiles.length < files.length) {
      toast({
        title: t("publish.warning") || "Avertissement",
        description: t("publish.some_photos_skipped"),
      })
    }

    // Convertit les photos HEIC/HEIF (format par défaut iPhone) en JPEG : sans
    // ça, l'aperçu reste vide et l'upload peut être rejeté par le serveur.
    const newFiles: File[] = []
    for (const file of selectedFiles) {
      try {
        newFiles.push(await convertHeicIfNeeded(file))
      } catch {
        toast({
          title: t("toast.error") || "Erreur",
          description: `${t("publish.file_error_prefix")} "${file.name}"${t("publish.file_error_suffix")}`,
          variant: "destructive",
        })
      }
    }

    const newPreviews = newFiles.map((file) => URL.createObjectURL(file))

    setImageFiles((prev) => [...prev, ...newFiles])
    setImagePreviews((prev) => [...prev, ...newPreviews])

    // Sans cette remise a zero, resélectionner exactement le(s) meme(s)
    // fichier(s) (ex: apres un premier essai qui semblait ne rien faire) ne
    // redeclenche pas l'evenement onChange - rien ne se passe, sans erreur.
    e.target.value = ""
  }

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index])
    setImageFiles(imageFiles.filter((_, i) => i !== index))
    setImagePreviews(imagePreviews.filter((_, i) => i !== index))
  }

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const allowedTypes = ["video/mp4", "video/mpeg"]
    const maxSizeBytes = 10 * 1024 * 1024
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: t("publish.invalid_video_format") || "Format video invalide",
        description: t("publish.invalid_video_format_desc") || "Veuillez choisir une video MP4 ou MPEG",
        variant: "destructive",
      })
      e.target.value = ""
      return
    }
    if (file.size > maxSizeBytes) {
      toast({
        title: t("publish.video_too_large") || "Video trop lourde",
        description: t("publish.video_too_large_desc") || "La video ne doit pas depasser 10MB",
        variant: "destructive",
      })
      e.target.value = ""
      return
    }
    if (videoPreview) URL.revokeObjectURL(videoPreview)
    const preview = URL.createObjectURL(file)
    setVideoFile(file)
    setVideoPreview(preview)
    e.target.value = ""
  }

  const removeVideo = () => {
    if (videoPreview) URL.revokeObjectURL(videoPreview)
    setVideoFile(null)
    setVideoPreview(null)
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      // Sans mimeType explicite, le conteneur choisi par le navigateur par
      // defaut est imprevisible et ne correspond pas toujours au 'audio/webm'
      // code en dur plus bas : le backend (qui verifie le contenu reel du
      // fichier, pas juste l'extension) rejette alors l'upload.
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm'
      const recorder = new MediaRecorder(stream, { mimeType })
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
        title: t("publish.recording_started") || "Enregistrement démarré",
        description: t("publish.recording_started_desc") || "Parlez maintenant pour décrire votre annonce",
      })
    } catch (error) {
      toast({
        title: t("toast.error") || "Erreur",
        description: t("publish.microphone_error") || "Impossible d'accéder au microphone",
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
        title: t("publish.recording_finished") || "Enregistrement terminé",
        description: `${t("publish.duration") || "Durée"}: ${recordingTime}s`,
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

  const validateForm = () => {
    const selectedCategory = categories.find(c => c.id.toString() === categoryId)
    const isAutreCategory = selectedCategory?.name === "Autre" || selectedCategory?.name === "Yeneen"

    if (!title || !price || !categoryId || !city || !district || !etat) {
      toast({
        title: t("publish.missing_fields") || "Champs manquants",
        description: t("publish.missing_fields_desc") || "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      })
      return false
    }

    if (existingPhotoUrls.length + imageFiles.length < 2) {
      toast({
        title: t("publish.photos_required") || "Photos obligatoires",
        description: t("publish.photos_required_desc") || "Veuillez ajouter au moins 2 photos",
        variant: "destructive",
      })
      return false
    }

    if (descriptionMode === 'text') {
      if (!description.trim() || description.trim().length < 20) {
        toast({
          title: t("publish.description_required") || "Description obligatoire",
          description: t("publish.description_required_desc") || "La description doit contenir au moins 20 caractères",
          variant: "destructive",
        })
        return false
      }
    } else if (!audioBlob) {
      toast({
        title: t("publish.description_required") || "Description obligatoire",
        description: t("publish.recording_required") || "Veuillez enregistrer une description vocale",
        variant: "destructive",
      })
      return false
    }

    if (isAutreCategory && !customCategory.trim()) {
      toast({
        title: t("publish.category_missing") || "Catégorie manquante",
        description: t("publish.category_missing_desc") || "Veuillez préciser la catégorie",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const handlePreview = () => {
    if (!validateForm()) return
    ;(window as any).__publishDraft = {
      imageFiles,
      videoFile,
      audioBlob,
      descriptionMode,
    }
    const payload = {
      title,
      description: descriptionMode === 'text'
        ? description.trim()
        : "Description vocale enregistrée - Écoutez l'audio pour plus de détails",
      price,
      negotiable,
      categoryId,
      customCategory,
      city,
      district,
      etat,
      photos: imagePreviews,
      hasVideo: !!videoFile,
      hasAudio: !!audioBlob,
      videoPreview: videoPreview || undefined,
      attributes: categoryAttributes,
    }
    sessionStorage.setItem("preview_annonce", JSON.stringify(payload))
    router.push("/publish/preview")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    setShowPublishConfirm(true)
  }

  const publishAnnonce = async () => {
    setShowPublishConfirm(false)
    setIsLoading(true)

    try {
      const selectedCategory = categories.find(c => c.id.toString() === categoryId)
      const isAutreCategory = selectedCategory?.name === "Autre" || selectedCategory?.name === "Yeneen"

      // Coordonnees approximatives a partir de la ville saisie (pas de demande
      // de permission de geolocalisation : ce n'est pas obligatoire pour publier)
      let latitude: number | undefined
      let longitude: number | undefined

      const cityCoords = getCityCoordinates(city)
      if (cityCoords) {
        latitude = cityCoords.lat
        longitude = cityCoords.lng
      }

      // Creer l'annonce
      const annonceData: any = {
        title,
        description: descriptionMode === 'text'
          ? description.trim()
          : "Description vocale enregistree - Ecoutez l'audio pour plus de details",
        price: parseFloat(price),
        negotiable,
        whatsapp_contact: whatsappContact,
        category_id: parseInt(categoryId),
        custom_category: isAutreCategory ? customCategory : null,
        city,
        district,
        etat,
        attributes: categoryAttributes,
      }

      // Ajouter les coordonnees si disponibles
      if (latitude !== undefined && longitude !== undefined) {
        annonceData.latitude = latitude
        annonceData.longitude = longitude
      }

      console.log(isEditMode ? 'Updating annonce with data:' : 'Creating annonce with data:', annonceData)
      const result = isEditMode
        ? await annonceService.update(Number(editId), annonceData)
        : await annonceService.create(annonceData)
      console.log('Result:', result)

      const annonceId = isEditMode ? Number(editId) : (result.data?.data?.id || result.data?.id)
      if (!result.success && (isEditMode || !annonceId)) {
        const errorMessage = result.errors
          ? Object.entries(result.errors).map(([field, messages]) => {
              return `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`
            }).join('\n')
          : result.message || (isEditMode ? t("publish.update_error_title") : "Erreur lors de la creation")
        toast({
          title: isEditMode ? t("publish.update_error_title") : (t("publish.create_error") || "Erreur de creation"),
          description: errorMessage,
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }
      console.log('Annonce created with ID:', annonceId)

      // Upload des photos si presentes
      if (imageFiles.length > 0 && annonceId) {
        console.log('Uploading', imageFiles.length, 'photos...')
        const uploadResult = await annonceService.uploadPhotos(annonceId, imageFiles)
        console.log('Photos upload result:', uploadResult)
        
        if (!uploadResult.success) {
          toast({
            title: t("publish.warning") || "Avertissement",
            description: t("publish.upload_photos_error") + (uploadResult.message ? (": " + uploadResult.message) : ''),
          })
        } else {
          console.log('Photos uploaded successfully')
        }
      }

      // Upload de l'audio vocal si present
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
              title: t("publish.warning") || "Avertissement",
              description: t("publish.upload_audio_error") || "Annonce creee mais erreur lors de l'upload de l'audio",
            })
          }
        } catch (error) {
          console.error("Erreur upload audio:", error)
        }
      }

      // Upload de la video si presente
      if (videoFile && annonceId) {
        const formData = new FormData()
        formData.append('video', videoFile)
        const videoUploadResult = await annonceService.uploadVideo(annonceId, formData)
        if (!videoUploadResult.success) {
          toast({
            title: t("publish.warning") || "Avertissement",
            description: t("publish.upload_video_error") || "Annonce creee mais erreur lors de l'upload de la video",
          })
        }
      }

      toast({
        title: isEditMode ? t("publish.update_success_title") : (t("publish.create_success") || "Creation avec succes"),
        description: isEditMode
          ? t("publish.update_success_desc")
          : (t("publish.create_success_desc") || "Votre annonce est maintenant en ligne"),
      })

      sessionStorage.removeItem("preview_annonce")
      ;(window as any).__publishDraft = null
      router.push(`/listings/${annonceId}`)
    } catch (error) {
      toast({
        title: t("toast.error") || "Erreur",
        description: t("publish.create_exception") || "Une erreur est survenue lors de la publication",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const selectedCategory = categories.find(c => c.id.toString() === categoryId)
  const isCustomCategory = selectedCategory?.name === "Autre" || selectedCategory?.name === "Yeneen"

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pb-16 md:pb-4 py-6 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-xl font-semibold mb-6">{isEditMode ? t("publish.edit_title") : t("publish")}</h1>

          {isLoadingExisting ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <section className="space-y-4">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Photos</h2>
              <div>
                <Label>{t("publish.photos_label")}</Label>
                <div className="mt-2 grid grid-cols-3 md:grid-cols-5 gap-3">
                  {existingPhotoUrls.map((url, idx) => (
                    <div key={`existing-${idx}`} className="relative aspect-square rounded-md overflow-hidden border">
                      <img src={resolveStorageUrl(url)} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                  {imagePreviews.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-md overflow-hidden border">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="destructive"
                        className="absolute top-1 right-1"
                        onClick={() => removeImage(idx)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  {existingPhotoUrls.length + imageFiles.length < 5 && (
                    <label className="aspect-square rounded-md border-2 border-dashed flex items-center justify-center cursor-pointer hover:bg-muted transition-colors">
                      <Upload className="w-5 h-5 text-muted-foreground" />
                      <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                    </label>
                  )}
                </div>
              </div>

              <div>
                <Label>{t("publish.video_optional")}</Label>
                {!videoFile ? (
                  <div className="mt-2">
                    <label className="flex items-center gap-3 w-full rounded-md border-2 border-dashed p-4 cursor-pointer hover:bg-muted transition-colors">
                      <Video className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{t("publish.add_video")}</span>
                      <input
                        type="file"
                        accept="video/mp4,video/mpeg"
                        className="hidden"
                        onChange={handleVideoUpload}
                      />
                    </label>
                  </div>
                ) : (
                  <div className="mt-2 space-y-3">
                    <video
                      className="w-full rounded-md border"
                      controls
                      src={videoPreview || undefined}
                    />
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{videoFile.name}</span>
                      <Button type="button" variant="destructive" size="sm" onClick={removeVideo}>
                        {t("publish.remove_video")}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </section>

            <section className="space-y-4 border-t pt-6">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{t("publish.section_description")}</h2>

              <div>
                <Label htmlFor="category">{t("publish.category_label")}</Label>
                <Select
                  value={categoryId}
                  onValueChange={(value) => {
                    setCategoryId(value)
                    setCategoryAttributes({})
                  }}
                >
                  <SelectTrigger id="category" className="mt-2">
                    <SelectValue placeholder={t("publish.select_category")} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground">{t("publish.loading")}</div>
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

              {categoryId && isCustomCategory && (
                <div>
                  <Label htmlFor="customCategory">{t("publish.specify_category")}</Label>
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

              {categoryId && (
                <CategoryAttributeFields
                  categoryId={categoryId}
                  values={categoryAttributes}
                  onChange={(key, value) => setCategoryAttributes((prev) => ({ ...prev, [key]: value }))}
                />
              )}

              <div>
                <Label htmlFor="title">{t("publish.title_label")}</Label>
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

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="description">{t("publish.description_star")}</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={descriptionMode === 'text' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setDescriptionMode('text')}
                    >
                      <Type className="w-4 h-4 mr-2" />
                      {t("publish.text_mode")}
                    </Button>
                    <Button
                      type="button"
                      variant={descriptionMode === 'voice' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setDescriptionMode('voice')}
                    >
                      <Mic className="w-4 h-4 mr-2" />
                      {t("publish.voice_mode")}
                    </Button>
                  </div>
                </div>

                {descriptionMode === 'text' ? (
                  <Textarea
                    id="description"
                    placeholder={t("publish.description_placeholder")}
                    rows={6}
                    className="mt-2"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    minLength={20}
                  />
                ) : (
                  <div className="mt-2 p-4 border rounded-md">
                    {!audioBlob ? (
                      <div className="flex flex-col items-center justify-center py-6 gap-3">
                        {!isRecording ? (
                          <>
                            <Button type="button" onClick={startRecording} className="gap-2">
                              <Mic className="w-4 h-4" />
                              {t("publish.record_button")}
                            </Button>
                            <p className="text-sm text-muted-foreground">
                              {t("publish.click_to_record")}
                            </p>
                          </>
                        ) : (
                          <>
                            <Button type="button" onClick={stopRecording} variant="destructive" className="gap-2">
                              <span className="w-2 h-2 rounded-full bg-white" />
                              <StopCircle className="w-4 h-4" />
                              {t("publish.stop_button_prefix")} ({formatTime(recordingTime)})
                            </Button>
                            <p className="text-sm text-muted-foreground">{t("publish.recording_in_progress")}</p>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Mic className="w-5 h-5 text-primary" />
                            <div>
                              <p className="text-sm font-medium">{t("publish.audio_recorded")}</p>
                              <p className="text-xs text-muted-foreground">
                                {t("publish.duration")}: {formatTime(recordingTime)}
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon-sm"
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
                          {t("publish.audio_not_supported")}
                        </audio>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>

            <section className="space-y-4 border-t pt-6">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{t("publish.section_price_location")}</h2>

              <div>
                <Label htmlFor="price">{t("publish.price_label")}</Label>
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
                    {t("publish.negotiable")}
                  </label>
                </div>
              </div>

              <div className="flex items-center space-x-2 rounded-md border p-3">
                <Checkbox
                  id="whatsappContact"
                  checked={whatsappContact}
                  onCheckedChange={(checked) => setWhatsappContact(checked as boolean)}
                />
                <label htmlFor="whatsappContact" className="text-sm font-medium leading-none flex-1">
                  {t("publish.whatsapp_consent")}
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">{t("publish.city_label")}</Label>
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
                  <Label htmlFor="district">{t("publish.district_label")}</Label>
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

              <div>
                <Label htmlFor="condition">{t("publish.condition_label")}</Label>
                <Select required value={etat} onValueChange={setEtat}>
                  <SelectTrigger id="condition" className="mt-2">
                    <SelectValue placeholder={t("publish.select_condition")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Neuf">{t("condition.new")}</SelectItem>
                    <SelectItem value="Bon état">{t("condition.good")}</SelectItem>
                    <SelectItem value="Usagé">{t("condition.used")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 border-t pt-6">
              <Button type="button" variant="outline" onClick={handlePreview} disabled={isLoading}>
                {t("actions.preview")}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("publish.publishing")}
                  </>
                ) : (
                  isEditMode ? t("publish.save_changes_button") : t("publish.publish_button_full")
                )}
              </Button>
            </div>
          </form>
          )}
        </div>
      </main>

      <AlertDialog open={showPublishConfirm} onOpenChange={setShowPublishConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{isEditMode ? t("publish.confirm_edit_title") : t("publish.confirm_create_title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {isEditMode
                ? t("publish.confirm_edit_desc")
                : t("publish.confirm_create_desc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>{t("actions.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={publishAnnonce} disabled={isLoading}>
              {isEditMode ? t("actions.save") : t("publish.publish_button")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BottomNav />
    </div>
  )
}
