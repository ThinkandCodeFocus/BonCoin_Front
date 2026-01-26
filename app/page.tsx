import { Header } from "@/components/header"
import { CategoryGrid } from "@/components/category-grid"
import { SearchBar } from "@/components/search-bar"
import { FeaturedListings } from "@/components/featured-listings"
import { BottomNav } from "@/components/bottom-nav"
import { Footer } from "@/components/footer"
import { LocationBar } from "@/components/location-bar"
import { Sparkles } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pb-20 md:pb-4">
        {/* Search sticky en haut (UX mobile + desktop) */}
        <div className="sticky top-[76px] z-40 px-4 md:px-6 pt-3">
          <div className="max-w-6xl mx-auto">
            <SearchBar variant="top" />
            <LocationBar />
          </div>
        </div>

        {/* Hero principal avec fond animé + photo à droite */}
        <section className="relative px-4 md:px-6 pt-8 pb-12 md:pt-14 md:pb-16 overflow-hidden reveal-up">
          <div className="max-w-6xl mx-auto">
            <div className="relative overflow-hidden rounded-[32px] border border-primary/20 bg-primary text-primary-foreground shadow-[0_32px_90px_rgba(15,23,42,0.35)]">
              <div className="absolute inset-0 bg-[url('/modern-apartment-interior.jpg')] bg-cover bg-center opacity-30" />
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/95 via-primary/85 to-primary/70" />
              <div className="absolute inset-0 gradient-mesh" />

              <div className="relative grid gap-10 md:gap-12 lg:gap-16 items-center p-7 md:p-12 lg:p-14 lg:grid-cols-2">
                {/* Colonne texte */}
                <div>
                  <div className="inline-flex items-center gap-2 bg-background/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-background/15">
                    <Sparkles className="w-4 h-4 text-accent" />
                    <span className="text-sm font-semibold text-background/95">
                      Trouvez la meilleure affaire près de chez vous
                    </span>
                  </div>

                  <h1 className="display-font text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-balance">
                    Achetez et vendez{" "}
                    <span className="text-accent drop-shadow-sm">en toute simplicité</span>
                  </h1>
                  <p className="mt-4 text-base md:text-lg opacity-95 max-w-2xl text-pretty">
                    Marketplace rapide, sécurisée et agréable. Des annonces, des catégories, et vos favoris en un clic.
                  </p>

                  <div className="mt-8 flex flex-wrap gap-3 text-sm">
                    <span className="px-3 py-1.5 rounded-full bg-background/10 border border-background/15">
                      Paiement & boost (à venir)
                    </span>
                    <span className="px-3 py-1.5 rounded-full bg-background/10 border border-background/15">
                      Messages & favoris
                    </span>
                    <span className="px-3 py-1.5 rounded-full bg-background/10 border border-background/15">
                      Catégories & recherche
                    </span>
                  </div>
                </div>

                {/* Colonne image / mockup d'annonce */}
                <div className="relative w-full max-w-md mx-auto">
                  <div className="relative aspect-[4/5] rounded-3xl overflow-hidden border border-background/20 bg-background/10 shadow-[0_24px_80px_rgba(15,23,42,0.55)] hero-photo">
                    <img
                      src="/samsung-galaxy-smartphone.png"
                      alt="Produit vedette"
                      className="absolute inset-0 w-full h-full object-contain p-6 drop-shadow-[0_24px_40px_rgba(0,0,0,0.35)]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent" />

                    <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-3 text-sm text-background">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-background/10 px-3 py-1 text-xs font-medium backdrop-blur">
                          <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                          Annonces en temps réel
                        </span>
                        <span className="rounded-full bg-background/15 px-3 py-1 text-xs font-medium backdrop-blur">
                          +10k annonces
                        </span>
                      </div>
                      <div className="rounded-2xl bg-background/85 text-foreground px-4 py-3 flex items-center justify-between gap-3 backdrop-blur">
                        <div>
                          <p className="text-xs text-muted-foreground">Proche de vous</p>
                          <p className="font-semibold">Téléphone dernier cri</p>
                        </div>
                        <span className="text-lg font-bold text-primary">95 000 FCFA</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 px-4 reveal-up">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">Explorez par catégorie</h2>
              <p className="text-muted-foreground text-lg">Trouvez exactement ce que vous cherchez</p>
            </div>
            <CategoryGrid />
          </div>
        </section>

        <div className="px-4 md:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="section-separator" aria-hidden="true">
              <span className="separator-dot" />
              <span className="separator-dot" />
              <span className="separator-dot" />
            </div>
          </div>
        </div>

        <section className="py-16 md:py-24 px-4 bg-muted/30 reveal-up">
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

      <Footer />
      <BottomNav />
    </div>
  )
}
