import { Card } from "@/components/ui/card"
import { Smartphone, Home, Car, Shirt, Sofa, Briefcase, BookOpen, Gift } from "lucide-react"
import Link from "next/link"

const categories = [
  { icon: Smartphone, name: "Téléphones", count: 1234, href: "/listings?category=phones" },
  { icon: Home, name: "Immobilier", count: 856, href: "/listings?category=real-estate" },
  { icon: Car, name: "Véhicules", count: 645, href: "/listings?category=vehicles" },
  { icon: Shirt, name: "Mode", count: 2341, href: "/listings?category=fashion" },
  { icon: Sofa, name: "Maison", count: 987, href: "/listings?category=home" },
  { icon: Briefcase, name: "Emploi", count: 432, href: "/listings?category=jobs" },
  { icon: BookOpen, name: "Loisirs", count: 765, href: "/listings?category=leisure" },
  { icon: Gift, name: "Autres", count: 1543, href: "/listings?category=other" },
]

export function CategoryGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      {categories.map((category) => {
        const Icon = category.icon
        return (
          <Link key={category.name} href={category.href}>
            <Card className="p-6 md:p-8 hover:shadow-2xl transition-all duration-300 cursor-pointer group border-border/50 hover:border-primary/20 hover:-translate-y-1">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-300 group-hover:scale-110">
                  <Icon className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-base mb-1">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">{category.count.toLocaleString()} annonces</p>
                </div>
              </div>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
