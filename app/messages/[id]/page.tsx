"use client"

import { useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { ConversationList } from "@/components/conversation-list"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Loader2, Mic, Send, ChevronLeft, AudioWaveform, MoreVertical, Flag, UserX } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useMessageNotifications } from "@/contexts/MessageNotificationContext"
import { messageService } from "@/lib/api"
import { toast } from "sonner"
import { resolveStorageUrl } from "@/lib/media"
import { ReportUserButton } from "@/components/report-user-button"
import { EmptyState } from "@/components/design-system"
import { cn } from "@/lib/utils"

interface Message {
  id: number
  user_id: number
  type: "text" | "audio"
  content: string | null
  created_at: string
  read_at?: string | null
  user?: {
    id: number
    name: string
    photo?: string
  }
}

export default function ConversationPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const bottomRef = useRef<HTMLDivElement | null>(null)

  const conversationId = Number.parseInt(params?.id || "0", 10)
  const { refreshUnreadCount } = useMessageNotifications()

  const [otherUser, setOtherUser] = useState<{ id: number; name: string; photo?: string } | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/")
      return
    }
    if (Number.isNaN(conversationId) || conversationId === 0) {
      toast.error("Conversation introuvable")
      router.push("/messages")
      return
    }
    loadMessages()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, conversationId])

  useEffect(() => {
    const interval = setInterval(() => {
      if (isAuthenticated && !Number.isNaN(conversationId) && conversationId > 0) {
        loadMessages(true)
      }
    }, 10000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, conversationId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages.length])

  const loadMessages = async (silent = false) => {
    if (!silent) setIsLoading(true)
    try {
      const result = await messageService.getMessages(conversationId)
      if (result.success && (result as any).data) {
        const data = (result as any).data
        const msgs = Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : []
        setMessages(msgs)

        const conversationData = data.conversation || data
        if (conversationData?.other_user) {
          const other = conversationData.other_user
          setOtherUser({ id: other.id, name: other.name, photo: other.photo })
        } else if (msgs.length > 0 && user) {
          const otherMsg = msgs.find((m: Message) => m.user_id !== user.id)
          if (otherMsg && otherMsg.user) {
            setOtherUser({ id: otherMsg.user.id, name: otherMsg.user.name, photo: otherMsg.user.photo })
          }
        }

        try {
          await messageService.markConversationAsRead(conversationId)
          await refreshUnreadCount()
        } catch {
          // ignore
        }
      } else if (!silent) {
        toast.error((result as any).message || "Impossible de charger les messages")
      }
    } catch (error) {
      if (!silent) toast.error("Erreur de connexion")
    } finally {
      if (!silent) setIsLoading(false)
    }
  }

  const handleSendText = async () => {
    if (!text.trim()) return

    setIsSending(true)
    try {
      const result = await messageService.sendMessage(conversationId, text.trim(), "text")
      if (result.success) {
        setText("")
        await loadMessages()
      } else {
        toast.error((result as any).message || "Erreur lors de l'envoi du message")
      }
    } catch (error) {
      toast.error("Erreur lors de l'envoi du message")
    } finally {
      setIsSending(false)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      })

      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus" })
      chunksRef.current = []

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data)
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" })
        setAudioBlob(blob)
        stream.getTracks().forEach((track) => track.stop())
      }

      recorder.onerror = () => {
        toast.error("Erreur lors de l'enregistrement")
      }

      mediaRecorderRef.current = recorder
      recorder.start(1000)
      setIsRecording(true)
      setRecordingDuration(0)

      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1)
      }, 1000)

      toast.success("Enregistrement démarré")
    } catch (error) {
      toast.error("Impossible d'accéder au microphone. Vérifiez les permissions.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)

      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
        recordingIntervalRef.current = null
      }

      toast.success("Enregistrement terminé")
    }
  }

  const sendAudio = async () => {
    if (!audioBlob) return

    setIsSending(true)
    try {
      const audioFile = new File([audioBlob], `voice_message_${Date.now()}.webm`, { type: "audio/webm" })
      const result = await messageService.sendAudioMessage(conversationId, audioFile)

      if (result.success) {
        setAudioBlob(null)
        setRecordingDuration(0)
        await loadMessages()
        toast.success("Message vocal envoyé !")
      } else {
        toast.error((result as any).message || "Erreur lors de l'envoi du message vocal")
      }
    } catch (error) {
      toast.error("Erreur lors de l'envoi du message vocal")
    } finally {
      setIsSending(false)
    }
  }

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)

      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
        recordingIntervalRef.current = null
      }

      setAudioBlob(null)
      setRecordingDuration(0)
      chunksRef.current = []

      toast.info("Enregistrement annulé")
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
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
      <main className="flex-1 pb-16 md:pb-4">
        <div className="max-w-5xl mx-auto md:my-6 border md:rounded-lg overflow-hidden grid grid-cols-1 md:grid-cols-[320px_1fr] h-[calc(100vh-4rem)] md:h-[calc(100vh-8rem)]">
          <div className="hidden md:block border-r">
            <ConversationList activeId={conversationId} />
          </div>

          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => router.push("/messages")}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <h1 className="font-semibold text-sm">{otherUser ? otherUser.name : "Conversation"}</h1>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => toast.info("Fonctionnalité à venir")}>
                    <UserX className="w-4 h-4 mr-2" />
                    Bloquer
                  </DropdownMenuItem>
                  <ReportUserButton
                    userId={otherUser?.id || 0}
                    userName={otherUser?.name}
                    trigger={
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Flag className="w-4 h-4 mr-2" />
                        Signaler
                      </DropdownMenuItem>
                    }
                  />
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : messages.length === 0 ? (
                <EmptyState
                  icon={AudioWaveform}
                  title="Aucun message pour le moment"
                  description="Dites bonjour pour commencer"
                />
              ) : (
                messages.map((msg) => {
                  const isMine = msg.user_id === user?.id
                  return (
                    <div key={msg.id} className={cn("flex", isMine ? "justify-end" : "justify-start")}>
                      <div
                        className={cn(
                          "max-w-[80%] rounded-md border p-3",
                          isMine ? "bg-primary/10 border-primary/20" : "bg-muted"
                        )}
                      >
                        {msg.type === "text" && msg.content && (
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        )}

                        {msg.type === "audio" && msg.content && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <AudioWaveform className="w-4 h-4 opacity-70" />
                              <span className="text-xs opacity-70">Message vocal</span>
                            </div>
                            <audio controls className="w-full h-8" preload="none" src={resolveStorageUrl(msg.content)}>
                              Votre navigateur ne supporte pas l'audio.
                            </audio>
                          </div>
                        )}

                        <div className="mt-1 text-xs text-muted-foreground">
                          {formatTime(msg.created_at)}
                          {isMine && msg.read_at && " · Lu"}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={bottomRef} />
            </div>

            <div className="border-t p-3 space-y-2 shrink-0">
              {isRecording && (
                <div className="flex items-center justify-between rounded-md border border-destructive/30 p-2">
                  <span className="text-sm text-destructive">
                    Enregistrement... {formatDuration(recordingDuration)}
                  </span>
                  <Button variant="destructive" size="sm" onClick={stopRecording}>
                    Arrêter
                  </Button>
                </div>
              )}

              {audioBlob && !isRecording && (
                <div className="flex items-center justify-between rounded-md border p-2">
                  <span className="text-sm">Vocal prêt ({formatDuration(recordingDuration)})</span>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={cancelRecording}>
                      Annuler
                    </Button>
                    <Button size="sm" onClick={sendAudio} disabled={isSending}>
                      Envoyer
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  placeholder="Écrivez votre message..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendText()}
                  disabled={isSending}
                />
                {!isRecording && !audioBlob && !text.trim() && (
                  <Button variant="outline" size="icon" onClick={startRecording} disabled={isSending}>
                    <Mic className="w-4 h-4" />
                  </Button>
                )}
                <Button onClick={handleSendText} disabled={isSending || (!text.trim() && !audioBlob)}>
                  {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
