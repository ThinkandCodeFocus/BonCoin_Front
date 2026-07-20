"use client"

import Link from "next/link"

const taxonomy = [
  {
    title: "Emploi",
    groups: [["Offres d'emploi", "Formations professionnelles"]],
  },
  {
    title: "Véhicules",
    groups: [["Voitures", "Motos", "Caravaning", "Utilitaires"], ["Équipement auto", "Équipement moto"]],
  },
  {
    title: "Locations de vacances",
    groups: [["Locations saisonnières"]],
  },
  {
    title: "Loisirs",
    groups: [
      ["Antiquités", "Collection", "CD - Musique", "DVD - Films", "Instruments de musique", "Livres"],
      ["Jeux & Jouets", "Loisirs créatifs", "Sport & Plein air", "Covoiturage"],
    ],
  },
  {
    title: "Électronique",
    groups: [["Ordinateurs", "Accessoires informatique", "Tablettes & Liseuses", "Photo, audio & vidéo"], ["Téléphones & Objets connectés", "Consoles", "Jeux vidéo"]],
  },
  {
    title: "Services",
    groups: [["Artistes & Musiciens", "Baby-Sitting", "Billetterie"]],
  },
  {
    title: "Famille",
    groups: [["Équipement bébé", "Mobilier enfant", "Vêtements bébé"]],
  },
  {
    title: "Maison & Jardin",
    groups: [["Ameublement", "Électroménager", "Arts de la table", "Décoration", "Linge de maison"], ["Bricolage", "Jardin & Plantes"]],
  },
]

export function Footer() {
  return (
    <footer className="mt-12 bg-muted/40 border-t">
      <div className="max-w-6xl mx-auto px-6 py-6 text-sm text-muted-foreground border-b">
        Avec LeMarché, trouvez la bonne affaire près de chez vous. Des milliers de petites annonces de particulier à
        particulier et de professionnels dans toutes les catégories : <Link href="/listings?category=3" className="text-primary hover:underline">véhicules</Link>,{" "}
        <Link href="/listings?category=2" className="text-primary hover:underline">immobilier</Link>,{" "}
        <Link href="/listings?category=7" className="text-primary hover:underline">emploi</Link>,{" "}
        <Link href="/listings?category=5" className="text-primary hover:underline">mode</Link> et bien plus. Déposez
        une annonce gratuite pour vendre, acheter ou donner vos biens de seconde main.
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 text-sm">
        {taxonomy.map((section) => (
          <div key={section.title} className="space-y-2">
            <p className="font-semibold uppercase text-xs tracking-wide">{section.title}</p>
            {section.groups.map((group, idx) => (
              <div key={idx} className={idx > 0 ? "pt-2 mt-2 border-t flex flex-col gap-1.5" : "flex flex-col gap-1.5"}>
                {group.map((link) => (
                  <Link key={link} href="#" className="text-muted-foreground hover:text-primary hover:underline">
                    {link}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="border-t">
        <div className="max-w-6xl mx-auto px-6 py-8 grid gap-8 md:grid-cols-4 text-sm">
          <div className="space-y-3">
            <p className="text-lg font-bold text-primary">LeMarché</p>
            <p className="text-muted-foreground">
              La marketplace C2C leader au Sénégal. Simple, rapide et local.
            </p>
          </div>

          <div className="space-y-2">
            <p className="font-semibold">À propos</p>
            <div className="flex flex-col gap-1.5 text-muted-foreground">
              <Link href="#" className="hover:text-primary hover:underline">Qui sommes-nous ?</Link>
              <Link href="#" className="hover:text-primary hover:underline">Nous rejoindre</Link>
              <Link href="#" className="hover:text-primary hover:underline">Publicité</Link>
              <Link href="#" className="hover:text-primary hover:underline">Impact environnemental</Link>
            </div>
          </div>

          <div className="space-y-2">
            <p className="font-semibold">Informations légales</p>
            <div className="flex flex-col gap-1.5 text-muted-foreground">
              <Link href="#" className="hover:text-primary hover:underline">CGU</Link>
              <Link href="#" className="hover:text-primary hover:underline">Confidentialité</Link>
              <Link href="#" className="hover:text-primary hover:underline">Mentions légales</Link>
              <Link href="#" className="hover:text-primary hover:underline">Cookie Policy</Link>
            </div>
          </div>

          <div className="space-y-2">
            <p className="font-semibold">Aide &amp; Contact</p>
            <div className="flex flex-col gap-1.5 text-muted-foreground">
              <Link href="#" className="hover:text-primary hover:underline">Centre d'aide</Link>
              <Link href="#" className="hover:text-primary hover:underline">Règles de diffusion</Link>
              <Link href="#" className="hover:text-primary hover:underline">Conseils de sécurité</Link>
              <Link href="#" className="hover:text-primary hover:underline">Contact</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t">
        <div className="max-w-6xl mx-auto px-6 py-3 text-xs text-muted-foreground flex flex-col md:flex-row items-center justify-between gap-2">
          <span>© 2024 LeMarché. Tous droits réservés.</span>
          <span>Dakar, Sénégal</span>
        </div>
      </div>
    </footer>
  )
}
