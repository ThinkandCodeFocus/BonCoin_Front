import { Header } from "@/components/header"
import { CategoryGrid } from "@/components/category-grid"
import { SearchBar } from "@/components/search-bar"
import { FeaturedListings } from "@/components/featured-listings"
import { BottomNav } from "@/components/bottom-nav"
import { Footer } from "@/components/footer"
import { LocationSelector } from "@/components/location-selector"
import { LocationBar } from "@/components/location-bar"
import { Sparkles, ArrowRight, Shield, Zap, Heart, ShoppingBag, Tag } from "lucide-react"
import Link from "next/link"

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

        {/* Hero principal avec fond vert + photo à droite */}
        <section className="relative px-4 md:px-6 pt-8 pb-12 md:pt-14 md:pb-16 overflow-hidden reveal-up">
          {/* Animated green background */}
          <div className="absolute inset-0 green-hero-bg" />
          
          {/* Decorative elements - Left side */}
          <div className="absolute left-0 top-1/4 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl animate-float" />
          <div className="absolute left-10 top-1/3 w-32 h-32 bg-green-400/15 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }} />
          
          {/* Decorative elements - Right side */}
          <div className="absolute right-0 bottom-1/4 w-72 h-72 bg-teal-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '0.5s' }} />
          <div className="absolute right-10 bottom-1/3 w-40 h-40 bg-emerald-300/15 rounded-full blur-2xl animate-float" style={{ animationDelay: '1.5s' }} />
          
          {/* Center glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl" />
          
          <div className="max-w-6xl mx-auto relative">
            <div className="relative overflow-hidden rounded-[32px] border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-xl shadow-[0_32px_90px_rgba(16,185,129,0.25)]">
              {/* Inner gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-transparent to-teal-500/20" />
              <div className="absolute inset-0 gradient-mesh" />

              <div className="relative grid gap-10 md:gap-12 lg:gap-16 items-center p-7 md:p-12 lg:p-14 lg:grid-cols-2">
                {/* Colonne texte */}
                <div>
                  <LocationSelector />

                  <h1 data-i18n="brand.tagline" className="display-font text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-balance mt-6">
                    Achetez et vendez{" "}
                    <span className="text-emerald-600 drop-shadow-sm">en toute simplicité</span>
                  </h1>
                  <p data-i18n="brand.description" className="mt-4 text-base md:text-lg opacity-90 max-w-2xl text-pretty text-emerald-800/80">
                    Marketplace rapide, sécurisée et agréable. Des annonces, des catégories, et vos favoris en un clic.
                  </p>

                  {/* Feature pills avec icônes */}
                    <div className="mt-8 flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 border border-white/30 backdrop-blur-sm">
                      <Shield className="w-4 h-4 text-emerald-600" />
                      <span data-i18n="features.secure" className="text-sm font-medium text-emerald-800">Sécurisé</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 border border-white/30 backdrop-blur-sm">
                      <Zap className="w-4 h-4 text-emerald-600" />
                      <span data-i18n="features.fast" className="text-sm font-medium text-emerald-800">Rapide</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 border border-white/30 backdrop-blur-sm">
                      <Heart className="w-4 h-4 text-emerald-600" />
                      <span data-i18n="features.favorites" className="text-sm font-medium text-emerald-800">Favoris</span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="mt-8">
                    <Link 
                      href="/publish"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-600 text-white font-semibold hover:bg-emerald-700 hover-scale transition-all shadow-lg"
                    >
                      <Sparkles className="w-5 h-5" />
                        <span data-i18n="publish">Déposer une annonce</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                {/* Colonne image / mockup d'annonce */}
                <div className="relative w-full max-w-md mx-auto">
                  <div className="relative aspect-[4/5] rounded-3xl overflow-hidden border border-white/20 bg-white/10 shadow-[0_24px_80px_rgba(16,185,129,0.3)] hero-photo">
                    <img
                      src="/samsung-galaxy-smartphone.png"
                      alt="Produit vedette"
                      className="absolute inset-0 w-full h-full object-contain p-6 drop-shadow-[0_24px_40px_rgba(0,0,0,0.35)]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/30 via-transparent to-transparent" />

                    <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur text-white">
                          <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                          Annonces en temps réel
                        </span>
                        <span className="rounded-full bg-white/25 px-3 py-1 text-xs font-medium backdrop-blur text-white">
                          +10k annonces
                        </span>
                      </div>
                      <div className="rounded-2xl bg-white/90 text-foreground px-4 py-3 flex items-center justify-between gap-3 backdrop-blur">
                        <div>
                          <p className="text-xs text-muted-foreground">Proche de vous</p>
                          <p className="font-semibold">Téléphone dernier cri</p>
                        </div>
                        <span className="text-lg font-bold text-emerald-700">95 000FCFA</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section Verte - Featured Categories & Welcome */}
        <section className="py-12 md:py-16 px-4 reveal-up">
          <div className="max-w-6xl mx-auto">
            <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-emerald-500/20 via-green-500/15 to-teal-500/20 border border-emerald-500/30 shadow-[0_20px_60px_rgba(16,185,129,0.2)]">
              {/* Animated background elements */}
              <div className="absolute inset-0">
                <div className="absolute top-4 left-4 w-24 h-24 bg-emerald-400/20 rounded-full blur-2xl animate-pulse" />
                <div className="absolute bottom-4 right-8 w-32 h-32 bg-green-400/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-emerald-300/10 rounded-full blur-3xl" />
              </div>
              
              <div className="relative px-8 py-12 md:py-16 md:px-12">
                {/* Header with icons */}
                <div className="text-center mb-10">
                  <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 mb-6">
                    <ShoppingBag className="w-5 h-5 text-emerald-600" />
                    <span data-i18n="premium.title" className="text-sm font-medium text-emerald-700">Marketplace Premium</span>
                  </div>
                  <h2 data-i18n="premium.subtitle" className="text-3xl md:text-4xl font-bold mb-4 text-emerald-900 dark:text-emerald-100">
                    Trouvez les meilleures offres
                  </h2>
                  <p data-i18n="premium.description" className="text-emerald-700/80 dark:text-emerald-300/80 text-lg max-w-2xl mx-auto">
                    Découvrez des milliers d'annonces dans votre région. Achetez et vendez en toute confiance.
                  </p>
                </div>

                {/* Quick stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-10">
                  <div className="text-center p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
                    <p className="text-3xl md:text-4xl font-bold text-emerald-700">10K+</p>
                    <p data-i18n="stats.listings" className="text-sm text-emerald-600/80">Annonces actives</p>
                  </div>
                  <div className="text-center p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
                    <p className="text-3xl md:text-4xl font-bold text-emerald-700">5K+</p>
                    <p data-i18n="stats.sellers" className="text-sm text-emerald-600/80">Vendeurs vérifiés</p>
                  </div>
                  <div className="text-center p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
                    <p className="text-3xl md:text-4xl font-bold text-emerald-700">50+</p>
                    <p data-i18n="stats.categories" className="text-sm text-emerald-600/80">Catégories</p>
                  </div>
                  <div className="text-center p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
                    <p className="text-3xl md:text-4xl font-bold text-emerald-700">24h</p>
                    <p data-i18n="stats.avg_time" className="text-sm text-emerald-600/80">Délai moyen</p>
                  </div>
                </div>

                {/* Quick links */}
                <div className="flex flex-wrap justify-center gap-4">
                  <Link 
                    href="/listings"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-600 text-white font-semibold hover:bg-emerald-700 hover-scale transition-all shadow-lg"
                  >
                    <Tag className="w-5 h-5" />
                    <span data-i18n="cta.browse">Parcourir les annonces</span>
                  </Link>
                  <Link 
                    href="/publish"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-emerald-800 font-semibold hover:bg-white/30 hover-scale transition-all"
                  >
                    <Sparkles className="w-5 h-5" />
                    <span data-i18n="publish">Déposer une annonce</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 px-4 reveal-up">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 data-i18n="explore.by_category" className="text-3xl md:text-4xl font-bold mb-3">Explorez par catégorie</h2>
              <p data-i18n="search.title" className="text-muted-foreground text-lg">Trouvez exactement ce que vous cherchez</p>
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
                <h2 data-i18n="listings.recent_title" className="text-3xl md:text-4xl font-bold mb-3">Annonces récentes</h2>
                <p data-i18n="listings.recent_subtitle" className="text-muted-foreground text-lg">Les dernières opportunités postées</p>
              </div>
              <Link 
                href="/listings"
                className="hidden md:flex items-center gap-2 text-primary font-medium hover:underline hover-scale"
              >
                <span data-i18n="listings.view_all">Voir toutes les annonces</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <FeaturedListings />
            <div className="mt-8 text-center md:hidden">
              <Link 
                href="/listings"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
              >
                <span data-i18n="listings.view_all">Voir toutes les annonces</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Section Call to Action */}
        <section className="py-16 md:py-24 px-4 reveal-up">
          <div className="max-w-4xl mx-auto">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-accent p-8 md:p-12 text-center">
              <div className="absolute inset-0 bg-[url('/placeholder.svg')] opacity-10" />
              <div className="relative">
                <h2 data-i18n="sell.prompt" className="text-2xl md:text-4xl font-bold text-primary-foreground mb-4">
                  Prêt à vendre vos articles ?
                </h2>
                <p data-i18n="sell.cta" className="text-lg text-primary-foreground/80 mb-8 max-w-xl mx-auto">
                  Déposez votre première annonce en quelques minutes et rejoignez notre communauté de vendeurs et acheteurs.
                </p>
                <Link 
                  href="/publish"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-background text-primary font-semibold hover:bg-background/90 hover-scale transition-all shadow-xl"
                >
                  <Sparkles className="w-5 h-5" />
                  <span data-i18n="sell.free_post">Déposer une annonce gratuite</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <BottomNav />
    </div>
  )
}
