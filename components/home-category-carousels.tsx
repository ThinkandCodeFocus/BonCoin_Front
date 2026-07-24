"use client"

import { useCategories } from "@/hooks/use-categories"
import { CategoryCarousel } from "@/components/category-carousel"

const MAX_HOME_CAROUSELS = 4

export function HomeCategoryCarousels() {
  const { categories } = useCategories()

  return (
    <>
      {categories.slice(0, MAX_HOME_CAROUSELS).map((category) => (
        <CategoryCarousel key={category.id} categoryId={category.id} categoryName={category.name} />
      ))}
    </>
  )
}
