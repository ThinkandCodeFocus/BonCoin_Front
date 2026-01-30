"use client"

import { useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Loader2, Mic, Send, StopCircle } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { messageService } from "@/lib/api"
import { toast } from "sonner"
import { resolveStorageUrl } from "@/lib/media"

interface Message {
  id: number
  user_id: number
  type: "text" | "audio"
  content: string | null
  created_at: string
  read_at?: string | null
}

export default function ConversationPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const bottomRef = useRef<HTMLDivElement | null>(null)

  const conversationId = Number.parseInt(params?.id || "", 10)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/")
      return
    }
    if (Number.isNaN(conversationId)) {
      toast.error("Conversation introuvable")
      router.push("/messages")
      return
    }
    loadMessages()
  }, [isAuthenticated, conversationId])

  useEffect(() => {
    const interval = setInterval(() => {
      if (isAuthenticated && !Number.isNaN(conversationId)) {
        loadMessages(true)
      }
    }, 8000)
    return () => clearInterval(interval)
  }, [isAuthenticated, conversationId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages.length])

  const loadMessages = async (silent = false) => {
    if (!silent) setIsLoading(true)
    const result = await messageService.getMessages(conversationId)
    if (result.success && result.data) {
      setMessages(Array.isArray(result.data) ? result.data : [])
    } else {
      toast.error(result.message || "Impossible de charger les messages")
    }
    if (!silent) setIsLoading(false)
  }

  const handleSendText = async () => {
    if (!text.trim()) return
    const result = await messageService.sendMessage(conversationId, text.trim(), "text")
    if (result.success) {
      setText("")
      await loadMessages()
    } else {
      toast.error(result.message || "Erreur lors de l'envoi du message")
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" })
        setAudioBlob(blob)
        stream.getTracks().forEach((track) => track.stop())
      }
      mediaRecorderRef.current = recorder
      recorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error(error)
      toast.error("Accès au micro refusé")
    }
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    setIsRecording(false)
  }

  const sendAudio = async () => {
    if (!audioBlob) return
    const audioFile = new File([audioBlob], `message_${Date.now()}.webm`, { type: "audio/webm" })
    const result = await messageService.sendAudioMessage(conversationId, audioFile)
    if (result.success) {
      setAudioBlob(null)
      await loadMessages()
    } else {
      toast.error(result.message || "Erreur lors de l'envoi audio")
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pb-20 md:pb-4 py-6 px-4">
        <div className="max-w-3xl mx-auto space-y-4">
          <h1 className="text-2xl font-bold">Conversation</h1>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-7 h-7 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-3">
              {messages.length === 0 ? (
                <Card className="p-6 text-center text-muted-foreground">
                  Aucun message pour le moment
                </Card>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.user_id === user?.id
                  return (
                    <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                      <Card className={`max-w-[80%] p-3 ${isMine ? "bg-primary text-primary-foreground" : ""}`}>
                        {msg.type === "audio" && msg.content ? (
                          <audio
                            controls
                            className="w-full"
                            src={resolveStorageUrl(msg.content)}
                          >
                            Votre navigateur ne supporte pas l'audio.
                          </audio>
                        ) : (
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        )}
                        <div className={`mt-2 text-xs ${isMine ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                          {formatTime(msg.created_at)}
                          {isMine && msg.read_at ? " · Vu" : ""}
                        </div>
                      </Card>
                    </div>
                  )
                })
              )}
              <div ref={bottomRef} />
            </div>
          )}

          <div className="border-t pt-4 space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Écrire un message..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendText()}
              />
              <Button onClick={handleSendText}>
                <Send className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center gap-3">
              {!isRecording ? (
                <Button variant="outline" onClick={startRecording}>
                  <Mic className="w-4 h-4 mr-2" />
                  Enregistrer
                </Button>
              ) : (
                <Button variant="destructive" onClick={stopRecording}>
                  <StopCircle className="w-4 h-4 mr-2" />
                  Stop
                </Button>
              )}
              {audioBlob && (
                <>
                  <audio controls className="max-w-xs" src={URL.createObjectURL(audioBlob)} />
                  <Button onClick={sendAudio}>Envoyer audio</Button>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
