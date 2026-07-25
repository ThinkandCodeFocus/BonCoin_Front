"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { AdminLayout } from "@/components/admin-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import { adminService } from "@/lib/api"
import { toast } from "sonner"
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

interface AdminUser {
  id: number
  name: string
  email: string
  phone?: string
  is_admin: boolean
  suspended_at: string | null
  created_at: string
  annonces_count: number
}

export default function AdminUserDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [user, setUser] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isActing, setIsActing] = useState(false)

  useEffect(() => {
    loadUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadUser = async () => {
    setIsLoading(true)
    const id = Number(params?.id)
    const result = await adminService.getUser(id)
    if (result.success) {
      setUser(result.data)
    } else {
      toast.error((result as any).message || "Utilisateur introuvable")
    }
    setIsLoading(false)
  }

  const handleToggleSuspend = async () => {
    if (!user) return
    setIsActing(true)
    const result = user.suspended_at
      ? await adminService.reactivateUser(user.id)
      : await adminService.suspendUser(user.id)

    if (result.success) {
      toast.success(user.suspended_at ? "Compte réactivé" : "Compte suspendu")
      await loadUser()
    } else {
      toast.error((result as any).message || "Erreur")
    }
    setIsActing(false)
  }

  const handleDelete = async () => {
    if (!user) return
    setIsActing(true)
    const result = await adminService.deleteUser(user.id)
    setShowDeleteConfirm(false)
    if (result.success) {
      toast.success("Compte supprimé")
      router.push("/admin")
    } else {
      toast.error((result as any).message || "Erreur")
    }
    setIsActing(false)
  }

  const formatDate = (dateString: string) =>
    new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(dateString))

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pb-16 md:pb-4">
        <AdminLayout>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : !user ? (
            <p className="text-sm text-muted-foreground">Utilisateur introuvable.</p>
          ) : (
            <div className="max-w-xl space-y-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <h1 className="text-base font-semibold">{user.name}</h1>
                {user.is_admin ? (
                  <Badge variant="secondary">Admin</Badge>
                ) : user.suspended_at ? (
                  <Badge variant="destructive">Suspendu</Badge>
                ) : (
                  <Badge variant="outline">Actif</Badge>
                )}
              </div>

              <Card className="p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span>{user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Téléphone</span>
                  <span>{user.phone || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Membre depuis</span>
                  <span>{formatDate(user.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Annonces publiées</span>
                  <span>{user.annonces_count}</span>
                </div>
                {user.suspended_at && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Suspendu le</span>
                    <span>{formatDate(user.suspended_at)}</span>
                  </div>
                )}
              </Card>

              {!user.is_admin && (
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={handleToggleSuspend} disabled={isActing}>
                    {user.suspended_at ? "Réactiver" : "Suspendre"}
                  </Button>
                  <Button variant="destructive" className="flex-1" onClick={() => setShowDeleteConfirm(true)} disabled={isActing}>
                    Supprimer le compte
                  </Button>
                </div>
              )}
            </div>
          )}
        </AdminLayout>
      </main>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce compte ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est définitive et supprime le compte de {user?.name}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BottomNav />
    </div>
  )
}
