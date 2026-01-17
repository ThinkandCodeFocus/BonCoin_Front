"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MessageCircle, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { messageService } from "@/lib/api"

export default function MessagesPage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [conversations, setConversations] = useState<any[]>([])

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/")
      return
    }
    loadConversations()
  }, [isAuthenticated])

  const loadConversations = async () => {
    setIsLoading(true)
    const result = await messageService.getConversations()
    if (result.success && result.data) {
      setConversations(Array.isArray(result.data) ? result.data : [])
    }
    setIsLoading(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pb-20 md:pb-4 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Messages</h1>
          
          {conversations.length === 0 ? (
            <Card className="p-8 text-center">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Aucun message pour le moment</p>
              <p className="text-sm text-muted-foreground mt-2">
                Les conversations avec les acheteurs et vendeurs apparaîtront ici
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {conversations.map((conv) => (
                <Card key={conv.id} className="p-4 cursor-pointer hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <p className="font-semibold">{conv.annonce?.title || "Conversation"}</p>
                      <p className="text-sm text-muted-foreground">
                        Avec {conv.buyer?.name || conv.seller?.name}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
