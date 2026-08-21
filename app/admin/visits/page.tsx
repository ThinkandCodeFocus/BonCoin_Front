"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { AdminLayout } from "@/components/admin-layout"
import { EmptyState } from "@/components/design-system"
import { Loader2 } from "lucide-react"
import { adminService } from "@/lib/api"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

interface DailyVisit {
  date: string
  total: number
  unique_visitors: number
}

interface CountryVisit {
  country_code: string
  country_name: string
  total: number
}

export default function AdminVisitsPage() {
  const [daily, setDaily] = useState<DailyVisit[]>([])
  const [byCountry, setByCountry] = useState<CountryVisit[]>([])
  const [totals, setTotals] = useState<{ total: number; unique_visitors: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    setIsLoading(true)
    const result = await adminService.getVisitStats(30)
    if (result.success && (result as any).data) {
      const data = (result as any).data
      setDaily(data.daily || [])
      setByCountry(data.by_country || [])
      setTotals(data.totals || null)
    }
    setIsLoading(false)
  }

  const formatDate = (dateString: string) =>
    new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(new Date(dateString))

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pb-16 md:pb-4">
        <AdminLayout>
          <div className="space-y-6">
            <h1 className="text-base font-semibold">Statistiques de visites (30 derniers jours)</h1>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="border rounded-lg p-4">
                    <p className="text-xs text-muted-foreground">Visites totales</p>
                    <p className="text-2xl font-semibold mt-1">{totals?.total ?? 0}</p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <p className="text-xs text-muted-foreground">Visiteurs uniques</p>
                    <p className="text-2xl font-semibold mt-1">{totals?.unique_visitors ?? 0}</p>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h2 className="text-sm font-semibold mb-4">Visites par jour</h2>
                  {daily.length === 0 ? (
                    <EmptyState title="Aucune visite enregistrée sur cette période" />
                  ) : (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={daily}>
                          <XAxis dataKey="date" tickFormatter={formatDate} fontSize={12} />
                          <YAxis allowDecimals={false} fontSize={12} />
                          <Tooltip labelFormatter={(value) => formatDate(String(value))} />
                          <Bar dataKey="total" name="Visites" fill="#2f4a3a" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="unique_visitors" name="Uniques" fill="#c17f3e" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                <div className="border rounded-lg overflow-hidden overflow-x-auto">
                  <h2 className="text-sm font-semibold p-4 pb-0">Répartition par pays</h2>
                  {byCountry.length === 0 ? (
                    <div className="p-4">
                      <EmptyState title="Aucune donnée de pays disponible" />
                    </div>
                  ) : (
                    <table className="w-full text-sm mt-3">
                      <thead className="bg-muted/50 text-muted-foreground">
                        <tr>
                          <th className="text-left font-medium px-4 py-2">Pays</th>
                          <th className="text-left font-medium px-4 py-2">Visites</th>
                        </tr>
                      </thead>
                      <tbody>
                        {byCountry.map((c) => (
                          <tr key={c.country_code} className="border-t">
                            <td className="px-4 py-2">{c.country_name || c.country_code}</td>
                            <td className="px-4 py-2">{c.total}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </>
            )}
          </div>
        </AdminLayout>
      </main>
      <BottomNav />
    </div>
  )
}
