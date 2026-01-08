"use client"

import type React from "react"

import { useState } from "react"
import { Header } from "@/components/header"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mail, Phone } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [authMethod, setAuthMethod] = useState<"email" | "sms">("email")
  const { toast } = useToast()

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setOtpSent(true)
      toast({
        title: "Code envoyé",
        description: `Un code de vérification a été envoyé à votre ${authMethod === "email" ? "email" : "téléphone"}.`,
      })
    }, 1500)
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Connexion réussie",
        description: "Vous êtes maintenant connecté.",
      })
    }, 1500)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-12 px-4 bg-muted/30">
        <div className="max-w-md mx-auto">
          <Card className="p-6">
            <h1 className="text-2xl font-bold mb-6 text-center">{otpSent ? "Vérification" : "Connexion"}</h1>

            {!otpSent ? (
              <Tabs value={authMethod} onValueChange={(v) => setAuthMethod(v as "email" | "sms")}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="email">
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </TabsTrigger>
                  <TabsTrigger value="sms">
                    <Phone className="w-4 h-4 mr-2" />
                    SMS
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="email">
                  <form onSubmit={handleSendOTP} className="space-y-4">
                    <div>
                      <Label htmlFor="email">Adresse email</Label>
                      <Input id="email" type="email" placeholder="votre@email.com" required />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Envoi..." : "Envoyer le code"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="sms">
                  <form onSubmit={handleSendOTP} className="space-y-4">
                    <div>
                      <Label htmlFor="phone">Numéro de téléphone</Label>
                      <Input id="phone" type="tel" placeholder="+221 77 123 45 67" required />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Envoi..." : "Envoyer le code"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div>
                  <Label htmlFor="otp">Code de vérification</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="123456"
                    maxLength={6}
                    className="text-center text-2xl tracking-widest"
                    required
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    Entrez le code à 6 chiffres envoyé à votre {authMethod === "email" ? "email" : "téléphone"}
                  </p>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Vérification..." : "Vérifier"}
                </Button>
                <Button type="button" variant="ghost" className="w-full" onClick={() => setOtpSent(false)}>
                  Changer de méthode
                </Button>
              </form>
            )}
          </Card>
        </div>
      </main>
    </div>
  )
}
