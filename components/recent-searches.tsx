"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Search } from "lucide-react"
import { getRecentSearches } from "@/components/search-bar"

export function RecentSearches() {
  const [searches, setSearches] = useState<string[]>([])

  useEffect(() => {
    setSearches(getRecentSearches())
  }, [])

  return (
    <div>
      <h2 className="text-base font-semibold mb-3">Recherches récentes</h2>

      {searches.length === 0 ? (
        <div className="border rounded-lg p-4">
          <p className="font-medium text-sm">Et si vous lanciez une première recherche ?</p>
          <p className="text-sm text-muted-foreground mt-1">
            Vos recherches s'afficheront ici pour y accéder facilement à tout moment.
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {searches.map((query) => (
            <Link
              key={query}
              href={`/listings?search=${encodeURIComponent(query)}`}
              className="inline-flex items-center gap-1.5 border rounded-full px-3 py-1.5 text-sm hover:bg-muted transition-colors"
            >
              <Search className="w-3.5 h-3.5 text-muted-foreground" />
              {query}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
