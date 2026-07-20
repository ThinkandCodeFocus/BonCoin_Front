import { Header } from "@/components/header"
import { CategoryGrid } from "@/components/category-grid"
import { SearchBar } from "@/components/search-bar"
import { FeaturedListings } from "@/components/featured-listings"
import { BottomNav } from "@/components/bottom-nav"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pb-16 md:pb-4">
        <div className="px-4 md:px-6 py-4">
          <div className="max-w-6xl mx-auto">
            <SearchBar variant="top" />
          </div>
        </div>

        <section className="px-4 md:px-6 py-2">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-base font-semibold mb-3">Top catégories</h2>
            <CategoryGrid />
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
