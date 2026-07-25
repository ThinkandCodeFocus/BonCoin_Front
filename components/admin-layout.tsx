"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"
import { Users, Flag, ScrollText } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"

const navItems = [
  { href: "/admin", label: "Utilisateurs", icon: Users },
  { href: "/admin/reports", label: "Signalements", icon: Flag },
  { href: "/admin/logs", label: "Journal", icon: ScrollText },
]

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated || !user?.is_admin) {
      router.push("/")
    }
  }, [isLoading, isAuthenticated, user, router])

  if (isLoading || !user?.is_admin) {
    return null
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6">
      <aside className="md:sticky md:top-20 md:self-start">
        <nav className="flex md:flex-col gap-1 overflow-x-auto">
          {navItems.map((item) => {
            const active = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm whitespace-nowrap",
                  active ? "bg-muted font-medium text-foreground" : "text-muted-foreground hover:bg-muted"
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>

      <div className="min-w-0">{children}</div>
    </div>
  )
}
