"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/AuthContext"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { GoogleSignInButton } from "@/components/google-sign-in-button"
import { useI18n } from "@/components/I18nProvider"

interface AuthDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultTab?: "login" | "register"
}

export function AuthDialog({ open, onOpenChange, defaultTab = "login" }: AuthDialogProps) {
  const { t, lang } = useI18n()
  const { login, loginWithGoogle, register } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState(defaultTab)

  const handleGoogleCredential = async (credential: string) => {
    setIsLoading(true)
    const success = await loginWithGoogle(credential)
    setIsLoading(false)
    if (success) {
      onOpenChange(false)
    }
  }

  const [loginIdentifier, setLoginIdentifier] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [showLoginPassword, setShowLoginPassword] = useState(false)

  const [registerName, setRegisterName] = useState("")
  const [registerEmail, setRegisterEmail] = useState("")
  const [registerPhone, setRegisterPhone] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")
  const [registerPasswordConfirmation, setRegisterPasswordConfirmation] = useState("")
  const [showRegisterPassword, setShowRegisterPassword] = useState(false)
  const [showRegisterPasswordConfirmation, setShowRegisterPasswordConfirmation] = useState(false)
  const [registerUserType, setRegisterUserType] = useState<'buyer' | 'seller' | 'both'>('both')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const success = await login(loginIdentifier, loginPassword)
    setIsLoading(false)
    if (success) {
      onOpenChange(false)
      setLoginIdentifier("")
      setLoginPassword("")
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!registerEmail.trim() && !registerPhone.trim()) {
      toast({
        title: t("auth.email_or_phone_required_title"),
        description: t("auth.email_or_phone_required_desc"),
        variant: "destructive",
      })
      return
    }

    const phoneRegex = /^(77|78|76|70|75|33)[0-9]{7}$/
    if (registerPhone.trim() && !phoneRegex.test(registerPhone)) {
      toast({
        title: t("auth.invalid_phone_title"),
        description: t("auth.invalid_phone_desc"),
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    const success = await register({
      name: registerName,
      email: registerEmail.trim() || undefined,
      phone: registerPhone.trim() || undefined,
      password: registerPassword,
      password_confirmation: registerPasswordConfirmation,
      language: lang,
      user_type: registerUserType,
    })
    setIsLoading(false)
    if (success) {
      onOpenChange(false)
      setRegisterName("")
      setRegisterEmail("")
      setRegisterPhone("")
      setRegisterPassword("")
      setRegisterPasswordConfirmation("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("auth.dialog_title")}</DialogTitle>
          <DialogDescription>{t("auth.dialog_desc")}</DialogDescription>
        </DialogHeader>

        <GoogleSignInButton onCredential={handleGoogleCredential} />
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">{t("auth.or")}</span>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "register")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">{t("login")}</TabsTrigger>
            <TabsTrigger value="register">{t("register")}</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-identifier">{t("auth.email_or_phone")}</Label>
                <Input
                  id="login-identifier"
                  type="text"
                  placeholder="email@example.com ou +221771234567"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">{t("auth.password")}</Label>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showLoginPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    aria-label={showLoginPassword ? t("auth.hide_password") : t("auth.show_password")}
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("auth.logging_in")}
                  </>
                ) : (
                  t("auth.login_button")
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="register-name">{t("auth.full_name")}</Label>
                <Input
                  id="register-name"
                  type="text"
                  placeholder="John Doe"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-email">{t("auth.email_below")}</Label>
                <Input
                  id="register-email"
                  type="email"
                  placeholder="email@example.com"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-phone">{t("auth.phone_above")}</Label>
                <Input
                  id="register-phone"
                  type="tel"
                  placeholder="771234567"
                  value={registerPhone}
                  onChange={(e) => setRegisterPhone(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-user-type">{t("auth.user_type")}</Label>
                <Select value={registerUserType} onValueChange={(value) => setRegisterUserType(value as 'buyer' | 'seller' | 'both')}>
                  <SelectTrigger id="register-user-type">
                    <SelectValue placeholder={t("auth.select_type")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="buyer">{t("auth.buyer_only")}</SelectItem>
                    <SelectItem value="seller">{t("auth.seller_only")}</SelectItem>
                    <SelectItem value="both">{t("auth.buyer_and_seller")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-password">{t("auth.password")}</Label>
                <div className="relative">
                  <Input
                    id="register-password"
                    type={showRegisterPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    required
                    minLength={6}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegisterPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    aria-label={showRegisterPassword ? t("auth.hide_password") : t("auth.show_password")}
                  >
                    {showRegisterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-password-confirmation">{t("auth.confirm_password")}</Label>
                <div className="relative">
                  <Input
                    id="register-password-confirmation"
                    type={showRegisterPasswordConfirmation ? "text" : "password"}
                    placeholder="••••••••"
                    value={registerPasswordConfirmation}
                    onChange={(e) => setRegisterPasswordConfirmation(e.target.value)}
                    required
                    minLength={6}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegisterPasswordConfirmation((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    aria-label={
                      showRegisterPasswordConfirmation ? t("auth.hide_password") : t("auth.show_password")
                    }
                  >
                    {showRegisterPasswordConfirmation ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("auth.registering")}
                  </>
                ) : (
                  t("auth.register_button")
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
