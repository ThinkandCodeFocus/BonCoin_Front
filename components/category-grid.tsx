"use client"

import {
  Smartphone,
  Home,
  Car,
  Shirt,
  Sofa,
  Briefcase,
  Gift,
  PawPrint,
  Gamepad2,
  Sparkles,
  Building2,
  Leaf,
} from "lucide-react"
import Link from "next/link"

const defaultCategories = [
  { id: 1, name: "Téléphones", icon: "Smartphone" },
  { id: 2, name: "Immobilier", icon: "Building2" },
  { id: 3, name: "Véhicules", icon: "Car" },
  { id: 4, name: "Meubles", icon: "Sofa" },
  { id: 5, name: "Mode", icon: "Shirt" },
  { id: 6, name: "Électronique", icon: "Smartphone" },
  { id: 7, name: "Services", icon: "Briefcase" },
  { id: 8, name: "Loisirs", icon: "Gamepad2" },
]

const getIconForName = (name: string) => {
  const n = name.toLowerCase()
  if (n.includes("vehicul") || n.includes("véhicul") || n.includes("voiture") || n.includes("auto")) return Car
  if (n.includes("immobilier") || n.includes("habitation")) return Building2
  if (n.includes("maison")) return Home
  if (n.includes("jardin")) return Leaf
  if (n.includes("electron") || n.includes("électron") || n.includes("informat") || n.includes("telephone") || n.includes("téléphone") || n.includes("mobile")) return Smartphone
  if (n.includes("meuble")) return Sofa
  if (n.includes("mode") || n.includes("vetement") || n.includes("vêtement")) return Shirt
  if (n.includes("beaute") || n.includes("beauté") || n.includes("cosmet")) return Sparkles
  if (n.includes("emploi") || n.includes("service") || n.includes("job")) return Briefcase
  if (n.includes("loisir") || n.includes("divert")) return Gamepad2
  if (n.includes("animal")) return PawPrint
  return Gift
}

export function CategoryGrid() {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
      {defaultCategories.map((category) => {
        const Icon = getIconForName(category.name)
        return (
          <Link
            key={category.id}
            href={`/listings?category=${category.id}`}
            className="flex flex-col items-center gap-2 p-3 border rounded-md bg-card hover:bg-muted transition-colors text-center"
          >
            <Icon className="w-5 h-5 text-primary" />
            <span className="text-xs font-medium">{category.name}</span>
          </Link>
        )
      })}
    </div>
  )
}
