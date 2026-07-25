"use client"

import Link from "next/link"
import { useCategories } from "@/hooks/use-categories"
import { CategoryIcon } from "@/components/category-icon"
import { cn } from "@/lib/utils"

export function CategoryGrid() {
  const { categories, isLoading } = useCategories()

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2 p-3 border-2 border-ink radius-indie">
            <div className="w-5 h-5 rounded skeleton" />
            <div className="h-3 w-12 rounded skeleton" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 md:gap-4">
      {categories.map((category, i) => (
        <Link
          key={category.id}
          href={`/listings?category=${category.id}`}
          className={cn(
            "press-hard flex flex-col items-center gap-2 p-3 md:p-4 border-2 border-ink radius-indie bg-card shadow-hard-sm hover:bg-muted text-center",
            i % 4 === 1 && "md:-translate-y-1",
            i % 4 === 3 && "md:translate-y-1"
          )}
        >
          <CategoryIcon icon={category.icon} className="w-5 h-5 text-primary" />
          <span className="text-xs font-medium">{category.name}</span>
        </Link>
      ))}
    </div>
  )
}
