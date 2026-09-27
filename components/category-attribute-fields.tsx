"use client"

import { useEffect, useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { categoryService } from "@/lib/api"
import { useI18n } from "@/components/I18nProvider"

export interface CategoryAttributeDef {
  id: number
  key: string
  label: string
  type: "text" | "number" | "select"
  options: string[] | null
  required: boolean
}

interface CategoryAttributeFieldsProps {
  categoryId: string
  values: Record<string, string>
  onChange: (key: string, value: string) => void
}

export function CategoryAttributeFields({ categoryId, values, onChange }: CategoryAttributeFieldsProps) {
  const { t } = useI18n()
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
          <Label htmlFor={`attr-${attribute.key}`}>
            {attribute.label} {attribute.required && "*"}
          </Label>
          {attribute.type === "select" ? (
            <Select
              value={values[attribute.key] || ""}
              onValueChange={(v) => onChange(attribute.key, v)}
            >
              <SelectTrigger id={`attr-${attribute.key}`} className="mt-2">
                <SelectValue placeholder={t("actions.select")} />
              </SelectTrigger>
              <SelectContent>
                {(attribute.options || []).map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              id={`attr-${attribute.key}`}
              type={attribute.type === "number" ? "number" : "text"}
              className="mt-2"
              value={values[attribute.key] || ""}
              onChange={(e) => onChange(attribute.key, e.target.value)}
              required={attribute.required}
            />
          )}
        </div>
      ))}
    </div>
  )
}
