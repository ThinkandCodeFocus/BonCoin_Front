"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { AdminLayout } from "@/components/admin-layout"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Loader2, BadgeCheck } from "lucide-react"
import { adminService } from "@/lib/api"
import { ListingPagination } from "@/components/listing-pagination"
import { EmptyState } from "@/components/design-system"

interface AdminUser {
  id: number
  name: string
  email: string
  phone?: string
  is_admin: boolean
  suspended_at: string | null
  is_verified: boolean
  created_at: string
  annonces_count: number
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    const delay = setTimeout(() => loadUsers(1), 400)
    return () => clearTimeout(delay)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const loadUsers = async (page: number) => {
    setIsLoading(true)
    const result = await adminService.getUsers({ page, search: search || undefined })
    if (result.success && result.data) {
      setUsers(result.data.data || [])
      setCurrentPage(result.data.current_page || page)
      setTotalPages(result.data.last_page || 1)
    }
    setIsLoading(false)
  }

  const formatDate = (dateString: string) =>
    new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" }).format(new Date(dateString))

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pb-16 md:pb-4">
        <AdminLayout>
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h1 className="text-base font-semibold">Utilisateurs</h1>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Nom, téléphone ou email"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : users.length === 0 ? (
              <EmptyState title="Aucun utilisateur trouvé" />
            ) : (
              <div className="border rounded-lg overflow-hidden overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-muted-foreground">
                    <tr>
                      <th className="text-left font-medium px-3 py-2">Nom</th>
                      <th className="text-left font-medium px-3 py-2">Contact</th>
                      <th className="text-left font-medium px-3 py-2">Annonces</th>
                      <th className="text-left font-medium px-3 py-2">Inscrit</th>
                      <th className="text-left font-medium px-3 py-2">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-t">
                        <td className="px-3 py-2">
                          <Link href={`/admin/users/${u.id}`} className="font-medium hover:underline inline-flex items-center gap-1">
                            {u.name}
                            {u.is_verified && <BadgeCheck className="w-3.5 h-3.5 text-primary" aria-label="Vérifié" />}
                          </Link>
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">
                          <div>{u.email}</div>
                          {u.phone && <div>{u.phone}</div>}
                        </td>
                        <td className="px-3 py-2">{u.annonces_count}</td>
                        <td className="px-3 py-2 text-muted-foreground">{formatDate(u.created_at)}</td>
                        <td className="px-3 py-2">
                          {u.is_admin ? (
                            <Badge variant="secondary">Admin</Badge>
                          ) : u.suspended_at ? (
                            <Badge variant="destructive">Suspendu</Badge>
                          ) : (
                            <Badge variant="outline">Actif</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <ListingPagination currentPage={currentPage} totalPages={totalPages} onPageChange={loadUsers} />
          </div>
        </AdminLayout>
      </main>
      <BottomNav />
    </div>
  )
}
