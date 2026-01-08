import { Header } from "@/components/header"
import { CategoryGrid } from "@/components/category-grid"
import { SearchBar } from "@/components/search-bar"
import { FeaturedListings } from "@/components/featured-listings"
import { BottomNav } from "@/components/bottom-nav"
import { Sparkles } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pb-20 md:pb-4">
        <section className="relative bg-primary text-primary-foreground py-20 md:py-28 px-4 overflow-hidden gradient-mesh">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/90" />
          <div className="relative max-w-6xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-accent/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-accent/30">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">Plus de 10,000 annonces actives</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 text-balance leading-tight">
              Achetez et vendez
              <br />
              <span className="text-accent">en toute simplicité</span>
            </h1>
            <p className="text-lg md:text-xl mb-8 opacity-90 max-w-2xl text-pretty">
              Découvrez des milliers d'opportunités près de chez vous. Rapide, sûr et gratuit.
            </p>
            <SearchBar />
          </div>
        </section>

        <section className="py-16 md:py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">Explorez par catégorie</h2>
              <p className="text-muted-foreground text-lg">Trouvez exactement ce que vous cherchez</p>
            </div>
            <CategoryGrid />
          </div>
        </section>

        <section className="py-16 md:py-24 px-4 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-3">Annonces récentes</h2>
                <p className="text-muted-foreground text-lg">Les dernières opportunités postées</p>
              </div>
            </div>
            <FeaturedListings />
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  )
}
