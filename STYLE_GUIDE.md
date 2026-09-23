# 🎨 Style Guide — LeMarché (refonte)

## Table des matières
1. [Philosophie de design](#philosophie-de-design)
2. [Typographie](#typographie)
3. [Palette de couleurs](#palette-de-couleurs)
4. [Composants UI](#composants-ui)
5. [Ombres, rayons, bordures](#ombres-rayons-bordures)
6. [Composants pas encore migrés](#composants-pas-encore-migrés)
7. [Bonnes pratiques](#bonnes-pratiques)

---

## Philosophie de design

Reconstruction complète de la présentation, inspirée des principes de composition
de marketplaces modernes (hiérarchie claire, sections aérées, cartes produit
épurées, recherche mise en avant) — **pas** une copie de leurs couleurs ni de
leur contenu, et **pas** un habillage de l'ancien système "Terre de Teranga"
(bordures épaisses, ombres dures, rayons asymétriques, palette terreuse), qui
est progressivement retiré ticket par ticket.

Principes :
- **Surfaces neutres et claires** : fond de page légèrement gris-froid, cartes
  blanches — contraste net entre page et carte (absent avant).
- **Un accent chaud unique** (orange-terracotta) pour les CTA et les éléments
  actifs — pas de multiplication de couleurs.
- **Ombres douces et subtiles** (`shadow-sm`/`shadow-md`), jamais d'ombre dure
  ni décalée.
- **Rayons symétriques et modérés**, pas de coins "faits main".
- **Une seule famille typographique** (DM Sans) pour tout le site — la
  hiérarchie se fait par taille/graisse, pas par un changement de police.
- **Blur ciblé et rare** : header au scroll, overlays flottants — jamais
  généralisé en glassmorphism.

---

## Typographie

### Fonte (voir `app/layout.tsx`)

Une seule famille : **DM Sans** (variable, `--font-dm-sans`), utilisée à la
fois pour le corps de texte et les titres.

```tsx
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" })
```

`--font-display` (utilitaire Tailwind `font-display`, encore présent dans des
composants pas migrés) pointe désormais vers la même police — aucun composant
existant ne casse visuellement, mais tout nouveau code doit utiliser
directement `font-sans` (ou rien, c'est la police par défaut) plutôt que
`font-display`, qui sera retiré une fois la migration terminée.

`h1`–`h4` ont par défaut `font-weight: 600` et `letter-spacing: -0.015em`
(`@layer base` dans `app/globals.css`) — pas besoin de le répéter par
composant, seule la taille (`text-*`) doit être choisie au cas par cas.

---

## Palette de couleurs

Définie en OKLCH dans `app/globals.css` (`:root` / `.dark`).

| Rôle | Usage |
|------|-------|
| `--primary` (orange-terracotta) | CTA, liens actifs, focus ring |
| `--secondary` (bleu-pétrole profond) | Actions secondaires, éléments de confiance |
| `--accent` (teinte très claire du primary) | Fonds de survol discrets (`hover:bg-accent`) |
| `--background` | Fond de page (gris très clair) |
| `--card` | Fond des cartes (blanc pur) — toujours plus clair que `--background` |
| `--muted` / `--muted-foreground` | Texte secondaire, fonds discrets |
| `--destructive` | Erreurs, suppression |
| `--border` / `--input` | Bordures fines, champs de formulaire |

```tsx
<div className="bg-background text-foreground">Fond de page</div>
<div className="bg-card border border-border rounded-xl shadow-sm">Card</div>
<Button variant="default">CTA principal</Button>
```

Toujours passer par ces variables (classes `bg-*`/`text-*`/`border-*`
Tailwind) — jamais de couleur en dur dans un composant, et jamais de valeur
recopiée depuis les images de référence externes.

---

## Composants UI

### 1. Boutons (`components/ui/button.tsx`)

```tsx
<Button variant="default">      // Orange-terracotta, shadow-sm
<Button variant="secondary">    // Bleu-pétrole
<Button variant="destructive">  // Rouge
<Button variant="outline">      // Bordure fine, fond transparent
<Button variant="ghost">        // Transparent, hover:bg-muted
<Button variant="link">         // Lien souligné
```

Feedback au clic : `active:scale-[0.98]` (léger, sur tous les boutons) — pas
de translation ni d'ombre qui se rétracte façon "papier pressé" (ancien
système). Tailles inchangées : `default` (36px), `sm` (32px), `lg` (44px),
`icon`/`icon-sm`/`icon-lg`.

### 2. Cards (`components/ui/card.tsx`)

```tsx
<Card>  {/* rounded-xl border border-border shadow-sm */}
  <CardHeader><CardTitle>Titre</CardTitle></CardHeader>
  <CardContent>Contenu</CardContent>
</Card>
```

Toute nouvelle carte produit/annonce doit reprendre ce vocabulaire (bordure
fine + `shadow-sm`, jamais `border-2`/ombre dure) même quand elle n'utilise
pas directement le composant `<Card>` (ex. `listing-card.tsx`, à migrer).

### 3. Badges (`components/ui/badge.tsx`)

```tsx
<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="new">Neuf</Badge>       // texte + bordure fine colorée
<Badge variant="good">Bon état</Badge>
<Badge variant="used">Occasion</Badge>
```

### 4. Champs de formulaire

`Input`/`Select`/`Textarea` : bordure fine (`border-input`), `rounded-lg`,
`shadow-xs`, focus ring standard (`focus-visible:ring-ring/50`). Ne jamais
utiliser `border-2`/`border-ink`.

### 5. Primitives réutilisables (`components/design-system.tsx`)

Avant d'écrire un nouveau helper, vérifier `formatPrice`, `TimeAgo`,
`StatusBadge`, `BoostedBadge`, `FavoriteButton`, `EmptyState`, `SectionHeader`,
`SkeletonCard` — ces primitives seront restylées dans leurs tickets respectifs
mais leur API ne change pas.

---

## Ombres, rayons, bordures

```css
--radius: 0.75rem;                       /* base */
--radius-sm: calc(var(--radius) - 4px);  /* 8px  - petits éléments */
--radius-md: calc(var(--radius) - 2px);  /* 10px - inputs, badges */
--radius-lg: var(--radius);              /* 12px - boutons */
--radius-xl: calc(var(--radius) + 2px);  /* 14px - cards */
```

Ombres : uniquement l'échelle Tailwind par défaut (`shadow-xs`, `shadow-sm`,
`shadow-md`, `shadow-lg`) — jamais d'ombre custom dure/décalée. Bordures :
`border` (1px) avec `border-border`/`border-input`, jamais `border-2`.

Aucune texture de fond (grain SVG) — surfaces plates, propres.

---

## Composants pas encore migrés

Ces fichiers utilisent encore les classes legacy "Terre de Teranga"
(`border-ink`, `shadow-hard*`, `radius-indie*`, `press-hard`, `.border-thick`)
— **conservées dans `app/globals.css` uniquement pour eux**, en pont vers le
neutre foncé (`--ink`), le temps de leur ticket de migration. Ne pas
réutiliser ces classes ailleurs :

- `components/header.tsx`, `components/bottom-nav.tsx` → ticket header/nav
- `app/page.tsx`, `components/location-picker.tsx` → ticket homepage / recherche
- `components/category-grid.tsx` → ticket catégories
- `components/listing-card.tsx` → ticket cartes annonce
- `components/footer.tsx` → ticket footer
- `components/transaction-banner.tsx`, `components/payment-dialog.tsx`
  (paiement escrow) → à intégrer au ticket de la page où ils apparaissent

Une fois tous migrés, supprimer le bloc "LEGACY" de `app/globals.css` et la
variable `--ink`.

---

## Bonnes pratiques

### Dark mode
Toutes les couleurs passent par les variables CSS — `.dark` les redéfinit,
aucune classe `dark:` ad hoc ne devrait être nécessaire pour les couleurs de
base. Vérifier chaque écran modifié en light **et** dark.

### Accessibilité
Focus visible géré globalement (`focus-visible:ring-ring/50
focus-visible:ring-[3px]`) — ne pas le supprimer en surchargeant `className`.

### Réduction d'animation
Règle globale déjà en place dans `app/globals.css`
(`prefers-reduced-motion: reduce` → durées à 0.01ms) — les futures animations
de scroll/reveal (ticket dédié, après la reconstruction visuelle) en
bénéficient automatiquement.

### Réutilisation avant duplication
Avant de créer une nouvelle classe ou un nouveau composant, vérifier
`app/globals.css`, `components/ui/*` et `components/design-system.tsx`.

---

## Maintenance

- **Styles globaux** : `app/globals.css`
- **Composants UI de base** : `components/ui/`
- **Primitives marketplace** : `components/design-system.tsx`
- **Layout & fontes** : `app/layout.tsx`

---

*Dernière mise à jour : Ticket 001 — Design system (refonte complète)*
