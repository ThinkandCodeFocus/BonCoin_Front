"use client"

import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Send, ImageIcon, Paperclip } from "lucide-react"
import { useState } from "react"

const conversations = [
  {
    id: 1,
    user: { name: "Fatou Ndiaye", avatar: "/serene-african-woman.png" },
    lastMessage: "Est-ce que l'iPhone est toujours disponible ?",
    time: "10:30",
    unread: 2,
    listing: { title: "iPhone 14 Pro Max", image: "/modern-smartphone.png" },
  },
  {
    id: 2,
    user: { name: "Mamadou Sall", avatar: "/thoughtful-african-man.png" },
    lastMessage: "D'accord, merci pour les informations",
    time: "Hier",
    unread: 0,
    listing: { title: "MacBook Pro M2", image: "/macbook.jpg" },
  },
]

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState(conversations[0])
  const [messageText, setMessageText] = useState("")

  const messages = [
    {
      id: 1,
      senderId: selectedConversation.user.name,
      text: "Bonjour, je suis intéressé par votre iPhone",
      time: "09:15",
      isOwn: false,
    },
    {
      id: 2,
      senderId: "Moi",
      text: "Bonjour ! Oui il est toujours disponible",
      time: "09:20",
      isOwn: true,
    },
    {
      id: 3,
      senderId: selectedConversation.user.name,
      text: "Est-ce que l'iPhone est toujours disponible ?",
      time: "10:30",
      isOwn: false,
    },
  ]

  const handleSendMessage = () => {
    if (messageText.trim()) {
      // Send message logic
      setMessageText("")
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pb-20 md:pb-4">
        <div className="max-w-6xl mx-auto h-[calc(100vh-140px)]">
          <div className="grid md:grid-cols-3 h-full">
            {/* Conversations List */}
            <div className="hidden md:block border-r overflow-y-auto">
              <div className="p-4 border-b">
                <h2 className="font-semibold text-lg">Messages</h2>
              </div>
              <div className="divide-y">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                      selectedConversation.id === conv.id ? "bg-muted" : ""
                    }`}
                    onClick={() => setSelectedConversation(conv)}
                  >
                    <div className="flex gap-3">
                      <Avatar>
                        <AvatarImage src={conv.user.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{conv.user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <p className="font-semibold truncate">{conv.user.name}</p>
                          <span className="text-xs text-muted-foreground">{conv.time}</span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <img
                            src={conv.listing.image || "/placeholder.svg"}
                            alt=""
                            className="w-8 h-8 rounded object-cover"
                          />
                          <p className="text-xs truncate">{conv.listing.title}</p>
                        </div>
                      </div>
                      {conv.unread > 0 && <Badge className="shrink-0">{conv.unread}</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            <div className="md:col-span-2 flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={selectedConversation.user.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{selectedConversation.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold">{selectedConversation.user.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <img
                      src={selectedConversation.listing.image || "/placeholder.svg"}
                      alt=""
                      className="w-6 h-6 rounded object-cover"
                    />
                    <p className="text-xs text-muted-foreground">{selectedConversation.listing.title}</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.isOwn ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.isOwn ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                        }`}
                      >
                        {message.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <ImageIcon className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Paperclip className="w-5 h-5" />
                  </Button>
                  <Input
                    placeholder="Écrire un message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button size="icon" onClick={handleSendMessage}>
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
