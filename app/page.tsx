import { Header } from "@/components/header"
import { CategoryGrid } from "@/components/category-grid"
import { LocationPicker } from "@/components/location-picker"
import { RecentSearches } from "@/components/recent-searches"
import { HomeCategoryCarousels } from "@/components/home-category-carousels"
import { FeaturedListings } from "@/components/featured-listings"
import { BottomNav } from "@/components/bottom-nav"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Reveal } from "@/components/reveal"
import { Plus } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pb-16 md:pb-4">
        <section className="px-4 md:px-6 pt-8 md:pt-12">
          <div className="max-w-6xl mx-auto">
            <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-secondary text-secondary-foreground px-6 py-12 md:py-16 md:px-12 flex flex-col items-start gap-4">
              <h1 className="text-3xl md:text-5xl font-bold leading-[1.05] tracking-tight max-w-lg">
                C&apos;est le moment de vendre
              </h1>
              <p className="text-secondary-foreground/75 max-w-md">
                Achetez et vendez facilement, partout au Sénégal.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link href="/publish">
                  <Button size="lg" className="gap-1.5">
                    <Plus className="w-4 h-4" />
                    Déposer une annonce
                  </Button>
                </Link>
                <span className="text-sm text-secondary-foreground/70">Gratuit · en 2 minutes</span>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 md:px-6 pt-8 md:pt-10">
          <Reveal className="max-w-6xl mx-auto">
            <LocationPicker />
          </Reveal>
        </section>

        <section className="px-4 md:px-6 pt-8">
          <Reveal className="max-w-6xl mx-auto">
            <RecentSearches />
          </Reveal>
        </section>

        <section className="px-4 md:px-6 pt-10 md:pt-14">
          <Reveal className="max-w-6xl mx-auto">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-5">Top catégories</h2>
            <CategoryGrid />
          </Reveal>
        </section>

        <section className="px-4 md:px-6 pt-10 md:pt-14 space-y-10">
          <Reveal className="max-w-6xl mx-auto space-y-10">
            <HomeCategoryCarousels />
          </Reveal>
        </section>

        <section className="px-4 md:px-6 pt-10 md:pt-14 pb-10">
          <Reveal className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl md:text-2xl font-bold tracking-tight">Annonces récentes</h2>
              <a href="/listings" className="text-sm font-semibold text-primary hover:underline">
                Voir tout
              </a>
            </div>
            <FeaturedListings />
          </Reveal>
        </section>
      </main>

      <Footer />
      <BottomNav />
    </div>
  )
}
