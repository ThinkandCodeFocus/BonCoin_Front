"use client"

import { useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Loader2, Mic, Send, StopCircle, AudioWaveform, MoreVertical, Flag, UserX } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useMessageNotifications } from "@/contexts/MessageNotificationContext"
import { messageService } from "@/lib/api"
import { toast } from "sonner"
import { resolveStorageUrl } from "@/lib/media"
import { ReportUserButton } from "@/components/report-user-button"

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

interface ConversationInfo {
  id: number
  other_user?: {
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
  const [isRecordingPaused, setIsRecordingPaused] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const bottomRef = useRef<HTMLDivElement | null>(null)

  const conversationId = Number.parseInt(params?.id || "0", 10)
  const { refreshUnreadCount } = useMessageNotifications()
  
  // État pour les informations de l'autre utilisateur
  const [otherUser, setOtherUser] = useState<{id: number, name: string, photo?: string} | null>(null)

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
  }, [isAuthenticated, conversationId])

  // Auto-refresh des messages toutes les 5 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      if (isAuthenticated && !Number.isNaN(conversationId) && conversationId > 0) {
        loadMessages(true)
      }
    }, 10000)
    return () => clearInterval(interval)
  }, [isAuthenticated, conversationId])

  // Scroll vers le bas quand nouveaux messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages.length])

  const loadMessages = async (silent = false) => {
    if (!silent) setIsLoading(true)
    try {
      console.log('Loading messages for conversation:', conversationId)
      const result = await messageService.getMessages(conversationId)
      console.log('Messages API result:', result)
      
      if (result.success && (result as any).data) {
        const data = (result as any).data
        const msgs = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : [])
        console.log('Loaded messages:', msgs)
        setMessages(msgs)
        
        // Extraire les informations de l'autre utilisateur depuis la réponse de l'API
        const conversationData = data.conversation || data
        if (conversationData?.other_user) {
          const other = conversationData.other_user
          setOtherUser({
            id: other.id,
            name: other.name,
            photo: other.photo,
          })
        } else if (msgs.length > 0 && user) {
          // Fallback : extraire depuis les messages
          const otherMsg = msgs.find((m: Message) => m.user_id !== user.id)
          if (otherMsg && otherMsg.user) {
            setOtherUser({
              id: otherMsg.user.id,
              name: otherMsg.user.name,
              photo: otherMsg.user.photo,
            })
          }
        }
        
        // Marquer la conversation comme lue
        try {
          await messageService.markConversationAsRead(conversationId)
          await refreshUnreadCount()
        } catch (e) {
          // ignore
        }
      } else if (!silent) {
        console.error('Failed to load messages:', result)
        toast.error((result as any).message || "Impossible de charger les messages")
      }
    } catch (error) {
      console.error('Error in loadMessages:', error)
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
      // Demander la permission du microphone
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        } 
      })
      
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      chunksRef.current = []
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }
      
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        stream.getTracks().forEach(track => track.stop())
      }
      
      recorder.onerror = (event) => {
        console.error("Recording error:", event)
        toast.error("Erreur lors de l'enregistrement")
      }
      
      mediaRecorderRef.current = recorder
      recorder.start(1000) // Collecter les données toutes les secondes
      setIsRecording(true)
      setRecordingDuration(0)
      
      // Démarrer le compteur
      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1)
      }, 1000)
      
      toast.success("Enregistrement démarré")
    } catch (error) {
      console.error("Microphone error:", error)
      toast.error("Impossible d'accéder au microphone. Vérifiez les permissions.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsRecordingPaused(false)
      
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
      console.log('=== SEND AUDIO DEBUG ===')
      console.log('Conversation ID:', conversationId)
      console.log('Audio blob size:', audioBlob.size)
      console.log('Audio blob type:', audioBlob.type)
      
      const audioFile = new File([audioBlob], `voice_message_${Date.now()}.webm`, { 
        type: 'audio/webm' 
      })
      console.log('Audio file:', audioFile.name, audioFile.size, audioFile.type)
      
      console.log('Calling messageService.sendAudioMessage...')
      const result = await messageService.sendAudioMessage(conversationId, audioFile)
      console.log('Send audio result:', result)
      
      if (result.success) {
        setAudioBlob(null)
        setRecordingDuration(0)
        await loadMessages()
        toast.success("Message vocal envoyé !")
      } else {
        toast.error((result as any).message || "Erreur lors de l'envoi du message vocal")
      }
    } catch (error) {
      console.error("Send audio error:", error)
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
    return `${mins}:${secs.toString().padStart(2, '0')}`
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

      <main className="flex-1 pb-32 pt-6 px-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {/* Header avec titre et menu */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">
              {otherUser ? `Chat avec ${otherUser.name}` : "Conversation"}
            </h1>
            
            {/* Menu avec options */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => {
                  //TODO: Bloquer l'utilisateur
                  toast.info("Fonctionnalité à venir")
                }}>
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

          {/* Liste des messages */}
          <div className="space-y-3 min-h-[300px] max-h-[60vh] overflow-y-auto p-2">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
              </div>
            ) : messages.length === 0 ? (
              <Card className="p-6 text-center text-muted-foreground border-dashed">
                <AudioWaveform className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Aucun message pour le moment</p>
                <p className="text-sm mt-1">Dites bonjour pour commencer !</p>
              </Card>
            ) : (
              messages.map((msg) => {
                const isMine = msg.user_id === user?.id
                return (
                  <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                    <Card className={`max-w-[85%] p-3 ${isMine ? "bg-primary text-primary-foreground" : ""}`}>
                      {/* Affichage du message texte */}
                      {msg.type === "text" && msg.content && (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      )}
                      
                      {/* Affichage du message audio */}
                      {msg.type === "audio" && msg.content && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <AudioWaveform className="w-5 h-5 opacity-70" />
                            <span className="text-xs opacity-70">Message vocal</span>
                          </div>
                          <audio
                            controls
                            className="w-full h-8"
                            preload="none"
                            src={resolveStorageUrl(msg.content)}
                          >
                            Votre navigateur ne supporte pas l'audio.
                          </audio>
                        </div>
                      )}
                      
                      {/* Horodatage */}
                      <div className={`mt-2 text-xs ${isMine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                        {formatTime(msg.created_at)}
                        {isMine && msg.read_at && " · Lu"}
                      </div>
                    </Card>
                  </div>
                )
              })
            )}
            <div ref={bottomRef} />
          </div>

          {/* Zone de saisie fixe en bas */}
          <div className="fixed bottom-0 left-0 right-0 bg-background p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] space-y-3 border-t z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
            {/* Indicateur d'enregistrement en cours */}
            {isRecording && (
              <Card className="p-3 bg-red-50 border-red-200 mb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-sm font-medium text-red-600">Enregistrement... {formatDuration(recordingDuration)}</span>
                  </div>
                  <Button variant="destructive" size="sm" onClick={stopRecording}>Arrêter</Button>
                </div>
              </Card>
            )}

            {/* Message audio prêt à l'envoi */}
            {audioBlob && !isRecording && (
              <Card className="p-3 bg-primary/5 border-primary/20 mb-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Vocal prêt ({formatDuration(recordingDuration)})</span>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={cancelRecording}>Annuler</Button>
                    <Button size="sm" onClick={sendAudio} disabled={isSending}>Envoyer le vocal</Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Saisie de texte TOUJOURS visible */}
            <div className="flex gap-2">
              <Input
                placeholder="Écrivez votre message ici..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendText()}
                disabled={isSending}
                autoFocus
                className="bg-muted/50 border-primary/20 focus-visible:ring-primary"
              />
              <Button 
                onClick={handleSendText} 
                disabled={isSending || (!text.trim() && !audioBlob)}
                className="shadow-md"
              >
                {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>

            {/* Bouton micro séparé pour ne pas gêner le texte */}
            {!isRecording && !audioBlob && (
              <Button
                variant="ghost"
                size="sm"
                onClick={startRecording}
                disabled={isSending}
                className="w-full text-xs text-muted-foreground hover:text-primary"
              >
                <Mic className="w-3 h-3 mr-2" />
                Enregistrer un message vocal au lieu du texte
              </Button>
            )}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
