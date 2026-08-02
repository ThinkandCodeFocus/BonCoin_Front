"use client"

import { useState, useEffect, useRef } from "react"
import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { AccountLayout } from "@/components/account-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Camera, Eye, EyeOff, UserX, Store } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { profileService, blockService } from "@/lib/api"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { resolveStorageUrl } from "@/lib/media"
import { convertHeicIfNeeded } from "@/lib/image"
import { EmptyState } from "@/components/design-system"
import { useI18n } from "@/components/I18nProvider"

export default function ProfileSettingsPage() {
  const { user, refreshUser, isAuthenticated } = useAuth()
  const router = useRouter()
  const { t } = useI18n()
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

  const [isProfessional, setIsProfessional] = useState(false)
  const [businessName, setBusinessName] = useState("")
  const [businessRegistration, setBusinessRegistration] = useState("")
  const [isSavingPro, setIsSavingPro] = useState(false)

  const [blockedUsers, setBlockedUsers] = useState<{ id: number; name: string; photo?: string }[]>([])
  const [isLoadingBlocked, setIsLoadingBlocked] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth")
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
      setIsProfessional(!!user.is_professional)
      setBusinessName(user.business_name || "")
      setBusinessRegistration(user.business_registration || "")
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
      toast.success(t("messages.user_unblocked"))
    } else {
      toast.error((result as any).message || t("toast.error"))
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
      toast.error(t("settings.photo_error"))
      setIsUploadingPhoto(false)
      return
    }

    if (!file.type.startsWith("image/")) {
      toast.error(t("settings.select_image"))
      setIsUploadingPhoto(false)
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error(t("settings.image_too_large"))
      setIsUploadingPhoto(false)
      return
    }

    const result = await profileService.uploadPhoto(file)

    if (result.success) {
      toast.success(t("settings.photo_updated"))
      await refreshUser()
    } else {
      const fieldError = (result as any).errors?.photo?.[0]
      toast.error(fieldError || result.message || t("settings.photo_upload_error"))
    }
    
    setIsUploadingPhoto(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.name || !formData.email) {
      toast.error(t("settings.name_email_required"))
      return
    }

    if (formData.password && formData.password !== formData.password_confirmation) {
      toast.error(t("settings.password_mismatch"))
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
      toast.success(t("settings.profile_updated"))
      await refreshUser()
      // Réinitialiser les champs de mot de passe
      setFormData({
        ...formData,
        password: "",
        password_confirmation: "",
      })
    } else {
      toast.error(result.message || t("settings.update_error"))
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

  const handleSaveProfessional = async () => {
    if (isProfessional && !businessName.trim()) {
      toast.error(t("settings.business_name_required"))
      return
    }
    setIsSavingPro(true)
    const result = await profileService.update({
      is_professional: isProfessional,
      business_name: isProfessional ? businessName : "",
      business_registration: isProfessional ? businessRegistration : "",
    })
    setIsSavingPro(false)
    if (result.success) {
      toast.success(isProfessional ? t("settings.pro_activated") : t("settings.pro_deactivated"))
      await refreshUser()
    } else {
      toast.error(result.message || t("settings.update_error"))
    }
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
            <h1 className="text-base font-semibold">{t("settings.title")}</h1>

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
                    {t("settings.change_photo")}
                  </p>
                  <p className="text-xs text-muted-foreground">{t("settings.photo_formats")}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t("settings.full_name")}</Label>
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
                  <Label htmlFor="email">{t("settings.email")}</Label>
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
                  <Label htmlFor="phone">{t("settings.phone")}</Label>
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
                  <h3 className="text-sm font-semibold mb-1">{t("settings.change_password")}</h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    {t("settings.password_hint")}
                  </p>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">{t("settings.new_password")}</Label>
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
                      <Label htmlFor="password_confirmation">{t("auth.confirm_password")}</Label>
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
                      {t("actions.saving")}
                    </>
                  ) : (
                    t("publish.save_changes_button")
                  )}
                </Button>
              </form>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Store className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold">{t("settings.professional_account")}</h2>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                {t("settings.professional_desc")}
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_professional"
                    checked={isProfessional}
                    onCheckedChange={(checked) => setIsProfessional(checked as boolean)}
                  />
                  <label htmlFor="is_professional" className="text-sm">
                    {t("settings.is_professional_label")}
                  </label>
                </div>

                {isProfessional && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="business_name">{t("settings.business_name")}</Label>
                      <Input
                        id="business_name"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="Ex: Boutique Fatou Mode"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="business_registration">{t("settings.business_registration")}</Label>
                      <Input
                        id="business_registration"
                        value={businessRegistration}
                        onChange={(e) => setBusinessRegistration(e.target.value)}
                        placeholder={t("settings.business_registration_placeholder")}
                      />
                    </div>
                  </>
                )}

                <Button onClick={handleSaveProfessional} disabled={isSavingPro} variant="outline" className="w-full">
                  {isSavingPro && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {t("actions.save")}
                </Button>
              </div>
            </Card>

            <Card className="p-4">
              <h2 className="text-sm font-semibold mb-3">{t("settings.blocked_users")}</h2>
              {isLoadingBlocked ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : blockedUsers.length === 0 ? (
                <EmptyState icon={UserX} title={t("settings.no_blocked_users")} />
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
                        {t("messages.unblock")}
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
