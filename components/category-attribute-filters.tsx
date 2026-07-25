"use client"

import { useEffect, useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { categoryService } from "@/lib/api"
import type { CategoryAttributeDef } from "@/components/category-attribute-fields"

interface CategoryAttributeFiltersProps {
  categoryId: string
  values: Record<string, string>
  onChange: (key: string, value: string) => void
}

export function CategoryAttributeFilters({ categoryId, values, onChange }: CategoryAttributeFiltersProps) {
  const [attributes, setAttributes] = useState<CategoryAttributeDef[]>([])

  useEffect(() => {
    if (!categoryId) {
      setAttributes([])
      return
    }
    categoryService.getAttributes(Number(categoryId)).then((result) => {
      if (result.success && Array.isArray(result.data)) {
        setAttributes(result.data)
      } else {
        setAttributes([])
      }
    })
  }, [categoryId])

  if (attributes.length === 0) return null

  return (
    <div className="space-y-4">
      {attributes.map((attribute) => (
        <div key={attribute.id}>
          <Label htmlFor={`filter-attr-${attribute.key}`}>{attribute.label}</Label>
          {attribute.type === "select" ? (
            <Select
              value={values[attribute.key] || "all"}
              onValueChange={(v) => onChange(attribute.key, v === "all" ? "" : v)}
            >
              <SelectTrigger id={`filter-attr-${attribute.key}`} className="mt-2">
                <SelectValue placeholder="Tous" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                {(attribute.options || []).map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              id={`filter-attr-${attribute.key}`}
              type={attribute.type === "number" ? "number" : "text"}
              className="mt-2"
              placeholder={attribute.label}
              value={values[attribute.key] || ""}
              onChange={(e) => onChange(attribute.key, e.target.value)}
            />
          )}
        </div>
      ))}
    </div>
  )
}
