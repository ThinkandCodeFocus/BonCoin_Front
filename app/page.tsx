import { Header } from "@/components/header"
import { CategoryGrid } from "@/components/category-grid"
import { LocationPicker } from "@/components/location-picker"
import { RecentSearches } from "@/components/recent-searches"
import { HomeCategoryCarousels } from "@/components/home-category-carousels"
import { FeaturedListings } from "@/components/featured-listings"
import { BottomNav } from "@/components/bottom-nav"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Plus, Sparkles } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pb-16 md:pb-4">
        <div className="px-4 md:px-6 pt-6 md:pt-8">
          <div className="max-w-6xl mx-auto">
            <div className="relative overflow-hidden border-2 border-ink radius-indie shadow-hard bg-secondary text-secondary-foreground px-6 py-10 md:py-14 md:px-10 flex flex-col items-start gap-5 md:-rotate-[0.4deg]">
              <svg
                aria-hidden="true"
                className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 opacity-[0.14] md:h-72 md:w-72"
                viewBox="0 0 200 200"
                fill="none"
              >
                <circle cx="100" cy="100" r="99" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="100" cy="100" r="72" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="100" cy="100" r="45" stroke="currentColor" strokeWidth="1.5" />
                <path d="M100 1v198M1 100h198" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              <svg
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-16 w-full opacity-[0.16]"
                viewBox="0 0 400 40"
                preserveAspectRatio="none"
              >
                <path
                  d="M0 30 Q 50 5, 100 30 T 200 30 T 300 30 T 400 30"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                />
              </svg>

              <span className="relative inline-flex items-center gap-1.5 rounded-full border border-current/25 bg-background/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                <Sparkles className="w-3 h-3" />
                Sénégal · 100% local
              </span>
              <h1 className="relative font-display text-3xl md:text-5xl font-bold leading-[1.05] max-w-lg">
                C'est le moment de vendre
              </h1>
              <div className="relative flex flex-wrap items-center gap-3">
                <Link href="/publish">
                  <Button variant="default" size="lg" className="gap-1.5 bg-primary text-primary-foreground">
                    <Plus className="w-4 h-4" />
                    Déposer une annonce
                  </Button>
                </Link>
                <span className="text-sm opacity-80">Gratuit · en 2 minutes</span>
              </div>
            </div>
          </div>
        </div>

        <section className="px-4 md:px-6 pt-5">
          <div className="max-w-6xl mx-auto">
            <LocationPicker />
          </div>
        </section>

        <section className="px-4 md:px-6 pt-5 pb-5">
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
