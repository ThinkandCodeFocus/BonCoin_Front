"use client"

import { useEffect } from "react"
import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { ConversationList } from "@/components/conversation-list"
import { EmptyState } from "@/components/design-system"
import { MessageCircle } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"

export default function MessagesPage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, router])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pb-16 md:pb-4">
        <div className="max-w-5xl mx-auto md:my-6 border md:rounded-lg overflow-hidden grid grid-cols-1 md:grid-cols-[320px_1fr] h-[calc(100vh-4rem)] md:h-[calc(100vh-8rem)]">
          <div className="border-r">
            <ConversationList />
          </div>
          <div className="hidden md:flex items-center justify-center">
            <EmptyState icon={MessageCircle} title="Sélectionnez une conversation" description="Choisissez une conversation dans la liste pour l'afficher ici" />
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
