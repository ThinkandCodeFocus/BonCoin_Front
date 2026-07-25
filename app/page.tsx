import { Header } from "@/components/header"
import { CategoryGrid } from "@/components/category-grid"
import { RecentSearches } from "@/components/recent-searches"
import { HomeCategoryCarousels } from "@/components/home-category-carousels"
import { FeaturedListings } from "@/components/featured-listings"
import { BottomNav } from "@/components/bottom-nav"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pb-16 md:pb-4">
        <div className="px-4 md:px-6 pt-6 md:pt-8">
          <div className="max-w-6xl mx-auto">
            <div className="border-2 border-ink radius-indie shadow-hard bg-secondary text-secondary-foreground px-6 py-10 md:py-12 flex flex-col items-start gap-5 md:-rotate-[0.4deg]">
              <h1 className="font-display text-3xl md:text-5xl font-bold leading-[1.05] max-w-lg">
                C'est le moment de vendre
              </h1>
              <Link href="/publish">
                <Button variant="default" size="lg" className="gap-1.5 bg-primary text-primary-foreground">
                  <Plus className="w-4 h-4" />
                  Déposer une annonce
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <section className="px-4 md:px-6 pt-8 pb-5">
          <div className="max-w-6xl mx-auto">
            <RecentSearches />
          </div>
        </section>

        <section className="px-4 md:px-6 py-3">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-display text-xl md:text-2xl font-semibold mb-4">Top catégories</h2>
            <CategoryGrid />
          </div>
        </section>

        <section className="px-4 md:px-6 pt-9 pb-7 space-y-10">
          <div className="max-w-6xl mx-auto space-y-10">
            <HomeCategoryCarousels />
          </div>
        </section>

        <section className="px-4 md:px-6 pt-5 pb-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl md:text-2xl font-semibold">Annonces récentes</h2>
              <a href="/listings" className="text-sm font-semibold text-primary hover:underline">
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
