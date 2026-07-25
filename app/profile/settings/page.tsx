"use client"

import { useState, useEffect, useRef } from "react"
import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { AccountLayout } from "@/components/account-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Camera, Eye, EyeOff, UserX } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { profileService, blockService } from "@/lib/api"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { resolveStorageUrl } from "@/lib/media"
import { convertHeicIfNeeded } from "@/lib/image"
import { EmptyState } from "@/components/design-system"

export default function ProfileSettingsPage() {
  const { user, refreshUser, isAuthenticated } = useAuth()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [isLoading, setIsLoading] = useState(false)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
  })

  const [blockedUsers, setBlockedUsers] = useState<{ id: number; name: string; photo?: string }[]>([])
  const [isLoadingBlocked, setIsLoadingBlocked] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/")
      return
    }

    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        password: "",
        password_confirmation: "",
      })
    }

    loadBlockedUsers()
  }, [isAuthenticated, user])

  const loadBlockedUsers = async () => {
    setIsLoadingBlocked(true)
    const result = await blockService.getAll()
    if (result.success && Array.isArray(result.data)) {
      setBlockedUsers(result.data)
    }
    setIsLoadingBlocked(false)
  }

  const handleUnblock = async (userId: number) => {
    const result = await blockService.unblock(userId)
    if (result.success) {
      setBlockedUsers((prev) => prev.filter((u) => u.id !== userId))
      toast.success("Utilisateur débloqué")
    } else {
      toast.error((result as any).message || "Erreur")
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handlePhotoClick = () => {
    fileInputRef.current?.click()
  }

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFile = e.target.files?.[0]
    if (!rawFile) return

    setIsUploadingPhoto(true)

    let file: File
    try {
      // Convertit les photos HEIC/HEIF (format par défaut iPhone) en JPEG :
      // sans ça, le type MIME n'est souvent pas reconnu par le navigateur et
      // l'upload est rejeté avant même d'atteindre le serveur.
      file = await convertHeicIfNeeded(rawFile)
    } catch {
      toast.error("Impossible de traiter cette image. Essayez un format JPEG ou PNG.")
      setIsUploadingPhoto(false)
      return
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez sélectionner une image")
      setIsUploadingPhoto(false)
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 2MB")
      setIsUploadingPhoto(false)
      return
    }

    const result = await profileService.uploadPhoto(file)
    
    if (result.success) {
      toast.success("Photo de profil mise à jour")
      await refreshUser()
    } else {
      const fieldError = (result as any).errors?.photo?.[0]
      toast.error(fieldError || result.message || "Erreur lors de l'upload de la photo")
    }
    
    setIsUploadingPhoto(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.name || !formData.email) {
      toast.error("Le nom et l'email sont requis")
      return
    }

    if (formData.password && formData.password !== formData.password_confirmation) {
      toast.error("Les mots de passe ne correspondent pas")
      return
    }

    setIsLoading(true)

    // Préparer les données à envoyer
    const updateData: any = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
    }

    // Ajouter le mot de passe seulement s'il est rempli
    if (formData.password) {
      updateData.password = formData.password
      updateData.password_confirmation = formData.password_confirmation
    }

    const result = await profileService.update(updateData)
    
    if (result.success) {
      toast.success("Profil mis à jour avec succès")
      await refreshUser()
      // Réinitialiser les champs de mot de passe
      setFormData({
        ...formData,
        password: "",
        password_confirmation: "",
      })
    } else {
      toast.error(result.message || "Erreur lors de la mise à jour")
      if ('errors' in result && result.errors) {
        Object.values(result.errors).forEach((errorArray: any) => {
          if (Array.isArray(errorArray)) {
            errorArray.forEach((error) => toast.error(error))
          }
        })
      }
    }
    
    setIsLoading(false)
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const photoUrl = user.photo
    ? resolveStorageUrl(user.photo)
    : ""

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pb-16 md:pb-4">
        <AccountLayout>
          <div className="max-w-xl space-y-6">
            <h1 className="text-base font-semibold">Paramètres du profil</h1>

            <Card className="p-4">
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={photoUrl} />
                    <AvatarFallback className="text-2xl">
                      {user.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon-sm"
                    className="absolute bottom-0 right-0"
                    onClick={handlePhotoClick}
                    disabled={isUploadingPhoto}
                  >
                    {isUploadingPhoto ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4" />
                    )}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Cliquez sur l'icône pour changer votre photo
                  </p>
                  <p className="text-xs text-muted-foreground">JPG, PNG ou GIF (max 2MB)</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet *</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+221 XX XXX XX XX"
                  />
                </div>

                <div className="border-t pt-4 mt-2">
                  <h3 className="text-sm font-semibold mb-1">Changer le mot de passe</h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    Laissez vide si vous ne souhaitez pas changer votre mot de passe
                  </p>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Nouveau mot de passe</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={handleInputChange}
                          minLength={8}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password_confirmation">Confirmer le mot de passe</Label>
                      <div className="relative">
                        <Input
                          id="password_confirmation"
                          name="password_confirmation"
                          type={showConfirmPassword ? "text" : "password"}
                          value={formData.password_confirmation}
                          onChange={handleInputChange}
                          minLength={8}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    "Enregistrer les modifications"
                  )}
                </Button>
              </form>
            </Card>

            <Card className="p-4">
              <h2 className="text-sm font-semibold mb-3">Utilisateurs bloqués</h2>
              {isLoadingBlocked ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : blockedUsers.length === 0 ? (
                <EmptyState icon={UserX} title="Aucun utilisateur bloqué" />
              ) : (
                <div className="space-y-2">
                  {blockedUsers.map((blocked) => (
                    <div key={blocked.id} className="flex items-center justify-between gap-3 p-2 border rounded-md">
                      <div className="flex items-center gap-2 min-w-0">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={blocked.photo ? resolveStorageUrl(blocked.photo) : undefined} />
                          <AvatarFallback>{blocked.name?.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm truncate">{blocked.name}</span>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => handleUnblock(blocked.id)}>
                        Débloquer
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </AccountLayout>
      </main>

      <BottomNav />
    </div>
  )
}
