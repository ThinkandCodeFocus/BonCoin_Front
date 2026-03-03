"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Globe } from "lucide-react"
import { useI18n } from "@/components/I18nProvider"

export function LanguageSwitcher() {
  const { lang, setLang } = useI18n()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Globe className="w-5 h-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setLang("fr")}>{lang === "fr" && "✓ "}<span data-i18n="language.fr">Français</span></DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLang("wo")}>{lang === "wo" && "✓ "}<span data-i18n="language.wo">Wolof</span></DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
