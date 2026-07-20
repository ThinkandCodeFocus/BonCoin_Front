import { Header } from "@/components/header"
import { CategoryGrid } from "@/components/category-grid"
import { RecentSearches } from "@/components/recent-searches"
import { CategoryCarousel } from "@/components/category-carousel"
import { FeaturedListings } from "@/components/featured-listings"
import { BottomNav } from "@/components/bottom-nav"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

const homeCarousels = [
  { categoryId: 1, categoryName: "Téléphones" },
  { categoryId: 2, categoryName: "Immobilier" },
  { categoryId: 3, categoryName: "Véhicules" },
  { categoryId: 7, categoryName: "Emploi" },
]

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pb-16 md:pb-4">
        <div className="px-4 md:px-6 pt-4">
          <div className="max-w-6xl mx-auto">
            <div className="rounded-lg bg-primary/10 border border-primary/20 px-6 py-8 flex flex-col items-start gap-4">
              <h1 className="text-xl md:text-2xl font-bold">C'est le moment de vendre</h1>
              <Link href="/publish">
                <Button className="gap-1.5">
                  <Plus className="w-4 h-4" />
                  Déposer une annonce
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <section className="px-4 md:px-6 py-6">
          <div className="max-w-6xl mx-auto">
            <RecentSearches />
          </div>
        </section>

        <section className="px-4 md:px-6 py-2">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-base font-semibold mb-3">Top catégories</h2>
            <CategoryGrid />
          </div>
        </section>

        <section className="px-4 md:px-6 py-6 space-y-8">
          <div className="max-w-6xl mx-auto space-y-8">
            {homeCarousels.map((c) => (
              <CategoryCarousel key={c.categoryId} categoryId={c.categoryId} categoryName={c.categoryName} />
            ))}
          </div>
        </section>

        <section className="px-4 md:px-6 py-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold">Annonces récentes</h2>
              <a href="/listings" className="text-sm text-primary hover:underline">
                Voir tout
              </a>
            </div>
            <FeaturedListings />
          </div>
        </section>
      </main>

      <Footer />
      <BottomNav />
    </div>
  )
}
