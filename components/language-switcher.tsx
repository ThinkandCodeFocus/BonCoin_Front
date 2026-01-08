"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Globe } from "lucide-react"

export function LanguageSwitcher() {
  const [language, setLanguage] = useState<"fr" | "wo">("fr")

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Globe className="w-5 h-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setLanguage("fr")}>{language === "fr" && "✓ "}Français</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage("wo")}>{language === "wo" && "✓ "}Wolof</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
