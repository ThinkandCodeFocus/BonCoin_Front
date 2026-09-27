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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Loader2, Mic, Send, ChevronLeft, AudioWaveform, MoreVertical, Flag, UserX, UserCheck, Link2, Lock } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useMessageNotifications } from "@/contexts/MessageNotificationContext"
import { messageService, blockService } from "@/lib/api"
import { toast } from "sonner"
import { resolveStorageUrl } from "@/lib/media"
import { ReportUserButton } from "@/components/report-user-button"
import { EmptyState } from "@/components/design-system"
import { TransactionBanner, type TransactionData } from "@/components/transaction-banner"
import { useI18n } from "@/components/I18nProvider"
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
  const { t } = useI18n()
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
  const [hasBlockedOther, setHasBlockedOther] = useState(false)
  const [blockedByOther, setBlockedByOther] = useState(false)
  const [showBlockConfirm, setShowBlockConfirm] = useState(false)

  const [annonce, setAnnonce] = useState<{
    id: number
    title: string
    price: number
    status: string
    source_url?: string | null
  } | null>(null)
  const [transaction, setTransaction] = useState<TransactionData | null>(null)
  const [isBuyer, setIsBuyer] = useState(false)
  const [isSeller, setIsSeller] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth")
      return
    }
    if (Number.isNaN(conversationId) || conversationId === 0) {
      toast.error(t("messages.not_found"))
      router.push("/messages")
      return
    }
    loadMessages()
    loadConversation()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, conversationId])

  const loadConversation = async () => {
    const result = await messageService.getConversation(conversationId)
    if (result.success && (result as any).data) {
      const data = (result as any).data
      const conv = data.conversation
      setAnnonce(conv?.annonce || null)
      setIsBuyer(!!user && conv?.buyer_id === user.id)
      setIsSeller(!!user && conv?.seller_id === user.id)
      setTransaction(data.transaction || null)
    }
  }

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
        }
        setHasBlockedOther(!!conversationData?.has_blocked_other)
        setBlockedByOther(!!conversationData?.blocked_by_other)
        if (!conversationData?.other_user && msgs.length > 0 && user) {
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
        toast.error((result as any).message || t("messages.load_error"))
      }
    } catch (error) {
      if (!silent) toast.error(t("toast.connection_error"))
    } finally {
      if (!silent) setIsLoading(false)
    }
  }

  const handleToggleBlock = async () => {
    if (!otherUser) return

    if (hasBlockedOther) {
      const result = await blockService.unblock(otherUser.id)
      if (result.success) {
        setHasBlockedOther(false)
        toast.success(t("messages.user_unblocked"))
      } else {
        toast.error((result as any).message || t("toast.error"))
      }
      return
    }

    const result = await blockService.block(otherUser.id)
    if (result.success) {
      setHasBlockedOther(true)
      setShowBlockConfirm(false)
      toast.success(t("messages.user_blocked"))
    } else {
      toast.error((result as any).message || t("toast.error"))
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
        toast.error((result as any).message || t("messages.send_error"))
      }
    } catch (error) {
      toast.error(t("messages.send_error"))
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
        toast.error(t("messages.recording_error"))
      }

      mediaRecorderRef.current = recorder
      recorder.start(1000)
      setIsRecording(true)
      setRecordingDuration(0)

      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1)
      }, 1000)

      toast.success(t("publish.recording_started"))
    } catch (error) {
      toast.error(t("messages.mic_permission_error"))
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

      toast.success(t("publish.recording_finished"))
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
        toast.success(t("messages.voice_sent"))
      } else {
        toast.error((result as any).message || t("messages.voice_send_error"))
      }
    } catch (error) {
      toast.error(t("messages.voice_send_error"))
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

      toast.info(t("messages.recording_cancelled"))
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
        <div className="max-w-5xl mx-auto md:my-6 border md:rounded-lg overflow-hidden grid grid-cols-1 md:grid-cols-[320px_1fr] h-[calc(100dvh-11rem)] md:h-[calc(100dvh-8rem)]">
          <div className="hidden md:block border-r">
            <ConversationList activeId={conversationId} />
          </div>

          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => router.push("/messages")}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <h1 className="font-semibold text-sm">{otherUser ? otherUser.name : t("messages.conversation_fallback")}</h1>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {hasBlockedOther ? (
                    <DropdownMenuItem onClick={handleToggleBlock}>
                      <UserCheck className="w-4 h-4 mr-2" />
                      {t("messages.unblock")}
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={() => setShowBlockConfirm(true)}>
                      <UserX className="w-4 h-4 mr-2" />
                      {t("messages.block")}
                    </DropdownMenuItem>
                  )}
                  <ReportUserButton
                    userId={otherUser?.id || 0}
                    userName={otherUser?.name}
                    trigger={
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Flag className="w-4 h-4 mr-2" />
                        {t("messages.report")}
                      </DropdownMenuItem>
                    }
                  />
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {annonce && (
              <TransactionBanner
                conversationId={conversationId}
                annonce={annonce}
                transaction={transaction}
                isBuyer={isBuyer}
                onUpdate={loadConversation}
              />
            )}

            {isSeller && annonce?.source_url && (
              <a
                href={annonce.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 text-xs border-b bg-amber-50 text-amber-900 hover:bg-amber-100 dark:bg-amber-950/30 dark:text-amber-200 dark:hover:bg-amber-950/50 shrink-0"
              >
                <Lock className="w-3.5 h-3.5 shrink-0" />
                <span className="flex-1">
                  {t("messages.private_note")}
                </span>
                <Link2 className="w-3.5 h-3.5 shrink-0" />
              </a>
            )}

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : messages.length === 0 ? (
                <EmptyState
                  icon={AudioWaveform}
                  title={t("messages.no_messages_title")}
                  description={t("messages.no_messages_desc")}
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
                              <span className="text-xs opacity-70">{t("messages.voice_message")}</span>
                            </div>
                            <audio controls className="w-full h-8" preload="none" src={resolveStorageUrl(msg.content)}>
                              {t("messages.audio_not_supported_short")}
                            </audio>
                          </div>
                        )}

                        <div className="mt-1 text-xs text-muted-foreground">
                          {formatTime(msg.created_at)}
                          {isMine && msg.read_at && ` · ${t("messages.read_suffix")}`}
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
                    {t("messages.recording_label")} {formatDuration(recordingDuration)}
                  </span>
                  <Button variant="destructive" size="sm" onClick={stopRecording}>
                    {t("publish.stop_button_prefix")}
                  </Button>
                </div>
              )}

              {audioBlob && !isRecording && (
                <div className="rounded-md border p-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{t("messages.voice_ready")} ({formatDuration(recordingDuration)})</span>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={cancelRecording}>
                        {t("actions.cancel")}
                      </Button>
                      <Button size="sm" onClick={sendAudio} disabled={isSending}>
                        {t("actions.send")}
                      </Button>
                    </div>
                  </div>
                  <audio controls className="w-full h-8" src={URL.createObjectURL(audioBlob)}>
                    {t("publish.audio_not_supported")}
                  </audio>
                </div>
              )}

              {hasBlockedOther || blockedByOther ? (
                <p className="text-sm text-muted-foreground text-center py-2">
                  {hasBlockedOther
                    ? t("messages.blocked_by_me")
                    : t("messages.blocked_by_other")}
                </p>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder={t("messages.write_placeholder")}
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
              )}
            </div>
          </div>
        </div>
      </main>

      <AlertDialog open={showBlockConfirm} onOpenChange={setShowBlockConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("messages.block_confirm_title")} {otherUser?.name} ?</AlertDialogTitle>
            <AlertDialogDescription>
              {t("messages.block_confirm_desc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("actions.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleToggleBlock}>{t("messages.block")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BottomNav />
    </div>
  )
}
