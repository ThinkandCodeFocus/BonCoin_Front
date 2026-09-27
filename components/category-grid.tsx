"use client"

import Link from "next/link"
import { useCategories } from "@/hooks/use-categories"
import { CategoryIcon } from "@/components/category-icon"

export function CategoryGrid() {
  const { categories, isLoading } = useCategories()

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-1 md:grid md:grid-cols-6 md:gap-4 md:overflow-visible">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2 shrink-0 w-20 md:w-auto">
            <div className="w-16 h-16 rounded-full skeleton" />
            <div className="h-3 w-14 rounded skeleton" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex gap-4 overflow-x-auto scrollbar-thin snap-x pb-1 md:grid md:grid-cols-6 md:gap-4 md:overflow-visible">
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/listings?category=${category.id}`}
          className="group flex flex-col items-center gap-2 shrink-0 w-20 md:w-auto snap-start text-center"
        >
          <span className="flex items-center justify-center w-16 h-16 rounded-full bg-muted text-primary transition-colors group-hover:bg-accent">
            <CategoryIcon icon={category.icon} className="w-6 h-6" />
          </span>
          <span className="text-xs font-medium line-clamp-2">{category.name}</span>
        </Link>
      ))}
    </div>
  )
}
