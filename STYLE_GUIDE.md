# 🎨 Style Guide - Marketplace BonCoin

## Table des matières
1. [Philosophie de design](#philosophie-de-design)
2. [Typographie](#typographie)
3. [Palette de couleurs](#palette-de-couleurs)
4. [Composants UI](#composants-ui)
5. [Effets visuels](#effets-visuels)
6. [Tokens CSS](#tokens-css)
7. [Bonnes pratiques](#bonnes-pratiques)

---

## Philosophie de design

### Objectifs
- **Moderne & Frais** : Apparence contemporaine avec des formes arrondies
- **Accessible** : Contraste suffisant et navigation intuitive
- **Cohérent** : Design system unifié sur toutes les pages
- **Anime** : Micro-interactions pour une expérience engageante
- **Mobile-first** : Priorité aux appareils mobiles

### Principes
```
┌─────────────────────────────────────────────────────────────┐
│  FORME          │  COULEUR          │  MOTION              │
├────────────────┼───────────────────┼──────────────────────┤
│  • Arrondis     │  • Émeraudes      │  • Transitions       │
│    généreux     │    profonds       │    fluides           │
│  • Cards        │  • Accents        │  • Hover effects     │
│    surélevées   │    chaleureux    │  • Animations        │
│  • Glassmorphism│  • Darks modernes │    subtiles          │
└────────────────┴───────────────────┴──────────────────────┘
```

---

## Typographie

### Fontes utilisées

| Type | Fonte | Usage | Weight |
|------|-------|-------|--------|
| **Display** | `DM Serif Display` | Titres H1, H2 Hero | 400 |
| **Sans** | `Sora` | Corps de texte, UI | 300-700 |

### Configuration (layout.tsx)
```tsx
const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
})

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
})
```

### Hiérarchie typographique

```markdown
# H1 - Display (Hero titles)
- Font: DM Serif Display
- Size: 3xl → 6xl (48-72px)
- Weight: Bold/ExtraBold
- Letter-spacing: -0.02em
- Example: "Achetez et vendez en toute simplicité"

## H2 - Section headers
- Font: Sora
- Size: 2xl → 4xl (32-48px)
- Weight: Bold
- Letter-spacing: -0.01em
- Example: "Explorez par catégorie"

### H3 - Card titles
- Font: Sora
- Size: lg → xl (20-24px)
- Weight: Semibold
- Example: "Téléphone dernier cri"

#### H4 - Item titles
- Font: Sora
- Size: base (16px)
- Weight: Medium
- Example: Price, Category name

##### Body text
- Font: Sora
- Size: sm → base (14-16px)
- Weight: Normal
- Line-height: 1.6

###### Caption
- Font: Sora
- Size: xs → sm (12-14px)
- Weight: Normal
- Color: muted-foreground
```

### Classes utilitaires typographiques

```css
/* Display font pour titres principaux */
.display-font {
  font-family: var(--font-display);
  letter-spacing: -0.02em;
}

/* Text gradient */
.text-gradient {
  background: linear-gradient(
    135deg,
    oklch(0.32 0.08 200) 0%,
    oklch(0.78 0.15 45) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Text balance pour éviter les lignes orphelines */
.text-balance {
  text-wrap: balance;
}
```

---

## Palette de couleurs

### Thème Clair (Light Mode)

#### Couleurs principales (CSS Variables)
```css
:root {
  /* Background & Foreground */
  --background: oklch(0.98 0.015 80);      /* #FAFAFA - Crème très léger */
  --foreground: oklch(0.18 0.03 210);       /* #1E293B - Bleu-gris foncé */
  
  /* Cards */
  --card: oklch(0.995 0.01 80);            /* Blanc pur */
  --card-foreground: oklch(0.18 0.03 210);
  
  /* Primary (Bleu profond) */
  --primary: oklch(0.32 0.08 200);         /* #2563EB - Bleu royal */
  --primary-foreground: oklch(0.99 0.005 80);
  
  /* Secondary (Gris bleuté) */
  --secondary: oklch(0.93 0.02 80);        /* #E2E8F0 */
  --secondary-foreground: oklch(0.24 0.03 210);
  
  /* Muted */
  --muted: oklch(0.95 0.02 80);             /* #F1F5F9 */
  --muted-foreground: oklch(0.48 0.04 210); /* #64748B */
  
  /* Accent (Émeraude chaud) */
  --accent: oklch(0.78 0.15 45);           /* #10B981 - Émeraude */
  --accent-foreground: oklch(0.2 0.03 210);
  
  /* Destructive */
  --destructive: oklch(0.58 0.2 25);      /* #EF4444 */
  --destructive-foreground: oklch(0.99 0.005 80);
  
  /* Borders & Inputs */
  --border: oklch(0.9 0.015 80);           /* #E2E8F0 */
  --input: oklch(0.98 0.01 80);
  --ring: oklch(0.78 0.15 45);
}
```

#### Thème Vert Émeraude (Hero sections)
```css
:root {
  /* Palette verte personnalisée */
  --green-50: oklch(0.97 0.02 150);
  --green-100: oklch(0.93 0.04 150);
  --green-200: oklch(0.87 0.06 150);
  --green-300: oklch(0.78 0.08 150);
  --green-400: oklch(0.68 0.1 150);
  --green-500: oklch(0.58 0.12 150);
  --green-600: oklch(0.48 0.1 150);
  --green-700: oklch(0.38 0.08 150);
  --green-800: oklch(0.28 0.06 150);
  --green-900: oklch(0.2 0.04 150);
  
  --emerald-50: oklch(0.96 0.02 170);
  --emerald-100: oklch(0.92 0.04 170);
  --emerald-200: oklch(0.85 0.06 170);
  --emerald-300: oklch(0.75 0.08 170);
  --emerald-400: oklch(0.64 0.1 170);
  --emerald-500: oklch(0.55 0.12 170);
  --emerald-600: oklch(0.45 0.1 170);
  --emerald-700: oklch(0.35 0.08 170);
  --emerald-800: oklch(0.26 0.06 170);
  --emerald-900: oklch(0.18 0.04 170);
}
```

### Thème Sombre (Dark Mode)

```css
.dark {
  /* Background sombre profond */
  --background: oklch(0.17 0.02 210);      /* #0F172A */
  --foreground: oklch(0.96 0.01 80);       /* #F8FAFC */
  
  /* Cards */
  --card: oklch(0.2 0.02 210);             /* #1E293B */
  --card-foreground: oklch(0.96 0.01 80);
  
  /* Primary (Accent plus clair en dark) */
  --primary: oklch(0.78 0.15 45);          /* #10B981 */
  --primary-foreground: oklch(0.2 0.03 210);
  
  /* Secondary */
  --secondary: oklch(0.24 0.03 210);       /* #1E293B */
  --secondary-foreground: oklch(0.96 0.01 80);
  
  /* Muted */
  --muted: oklch(0.22 0.02 210);          /* #1E293B */
  --muted-foreground: oklch(0.7 0.03 210);/* #94A3B8 */
  
  /* Accent (Bleu profond) */
  --accent: oklch(0.7 0.12 200);          /* #3B82F6 */
  --accent-foreground: oklch(0.18 0.03 210);
  
  /* Destructive */
  --destructive: oklch(0.5 0.18 25);
  --destructive-foreground: oklch(0.99 0.005 80);
  
  /* Borders */
  --border: oklch(0.3 0.02 210);          /* #334155 */
  --input: oklch(0.26 0.02 210);
  --ring: oklch(0.78 0.15 45);
}
```

### Utilisation des couleurs

```tsx
// Classes Tailwind pour les couleurs
<div className="bg-background text-foreground">Page bg</div>
<div className="bg-card text-card-foreground">Card</div>
<div className="bg-primary text-primary-foreground">Primary btn</div>
<div className="bg-accent text-accent-foreground">Accent elements</div>
<div className="bg-secondary text-secondary-foreground">Secondary</div>
<div className="bg-muted text-muted-foreground">Muted text</div>

// Backdrops et overlays
<div className="bg-black/50">Overlay sombre</div>
<div className="bg-white/20 backdrop-blur">Glass effect</div>

// Gradients
<div className="bg-gradient-to-r from-primary to-accent">
```

---

## Composants UI

### 1. Boutons (Button)

**Variantes disponibles :**

```tsx
<Button variant="default">     // Primary (Bleu) → bg-primary
<Button variant="secondary">   // Secondary (Gris) → bg-secondary  
<Button variant="destructive"> // Rouge danger → bg-destructive
<Button variant="outline">     // Bordure seule → border bg-transparent
<Button variant="ghost">       // Transparent → hover:bg-accent
<Button variant="link">        // Lien souligné → text-primary
```

**Tailles disponibles :**

```tsx
<Button size="default">    // h-9 px-4 py-2 (36px)
<Button size="sm">         // h-8 rounded-md (32px)
<Button size="lg">         // h-10 rounded-md (40px)
<Button size="icon">       // size-9 (36px)
<Button size="icon-sm">    // size-8 (32px)
<Button size="icon-lg">    // size-10 (40px)
```

**Boutons personnalisés du design system :**

```tsx
// Bouton CTA principal (hero, CTAs)
<Button className="rounded-full px-6 bg-accent text-accent-foreground 
                  hover:bg-accent/90 shadow-lg hover:shadow-xl">
  Déposer une annonce
</Button>

// Bouton ghost arrondi
<Button variant="ghost" className="rounded-full hover:bg-muted">
  <Icon className="w-5 h-5" />
</Button>
```

### 2. Cards

**Structure :**

```tsx
<Card>
  <CardHeader>
    <CardTitle>Titre</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Contenu</CardContent>
  <CardFooter>Footer actions</CardFooter>
</Card>
```

**Classes personnalisées (globals.css) :**

```css
/* Glass card avec blur */
.glass-card {
  @apply backdrop-blur-xl bg-card/85 border border-border/60 
         shadow-[0_12px_40px_rgba(15,23,42,0.12)];
}

/* Card avec animation hover */
.card-animate {
  transition: transform 280ms ease, box-shadow 280ms ease, 
              border-color 280ms ease;
}
.card-animate:hover {
  transform: translateY(-6px);
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.16);
}

/* Card avec lueur glow */
.card-glow::before {
  content: "";
  position: absolute;
  inset: -2px;
  background: linear-gradient(
    135deg,
    oklch(0.78 0.15 45 / 0.4),
    oklch(0.32 0.08 200 / 0.4),
    oklch(0.78 0.15 45 / 0.4)
  );
  border-radius: inherit;
  z-index: -1;
  opacity: 0;
  transition: opacity 0.4s ease;
}
.card-glow:hover::before {
  opacity: 1;
}

/* Card lift avec ombre dynamique */
.card-lift {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.card-lift:hover {
  transform: translateY(-8px);
  box-shadow: 
    0 25px 50px -12px rgba(15, 23, 42, 0.25),
    0 0 0 1px rgba(15, 23, 42, 0.05);
}
```

### 3. Badges / Tags

**Variantes :**

```tsx
<Badge>Default</Badge>                          // Primary bg
<Badge variant="secondary">Secondary</Badge>  // Secondary bg
<Badge variant="destructive">Error</Badge>  // Destructive bg
<Badge variant="outline">Outline</Badge>     // Border only

// Badges de statut personnalisés
<span className="status-badge status-new">Neuf</span>
<span className="status-badge status-good">Bon état</span>
<span className="status-badge status-used">Occasion</span>
```

### 4. Inputs

**Style par défaut :**

```tsx
<Input 
  placeholder="Rechercher..."
  className="focus-visible:ring-ring/50 focus-visible:ring-[3px]"
/>

// Avec effet glow
<div className="input-glow:focus-within">
  <Input />
</div>
```

### 5. Avatars

```tsx
<Avatar className="w-8 h-8">                    // Default
<Avatar className="w-10 h-10">                   // Medium
<Avatar className="w-12 h-12">                   // Large
<Avatar className="w-16 h-16">                   // XL

// Avatar avec ring
<Avatar className="ring-2 ring-primary ring-offset-2">
  <AvatarImage src="/photo.jpg" />
  <AvatarFallback>JD</AvatarFallback>
</Avatar>
```

### 6. Header (Sticky)

```tsx
<header className="sticky top-0 z-50 glass-card border-b border-border/70">
  {/* Contenu header */}
</header>
```

### 7. Hex Card (Catégories)

```tsx
<div className="hex-card">
  <div className="hex-card-inner">
    {/* Contenu */}
  </div>
</div>
```

---

## Effets visuels

### 1. Animations CSS (@keyframes)

```css
/* Fond flottant */
@keyframes drift {
  0% { transform: translate3d(0, 0, 0); }
  50% { transform: translate3d(-2%, 1.5%, 0); }
  100% { transform: translate3d(0, 0, 0); }
}

/* Apparition vers le haut */
@keyframes rise {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Pulsation des points */
@keyframes pulse-dot {
  0%, 100% { transform: scale(1); opacity: 0.85; }
  50% { transform: scale(1.08); opacity: 1; }
}

/* Shimmer loading */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* Float animation */
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

/* Fade in up page transition */
@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Heart beat */
@keyframes heart-beat {
  0%, 100% { transform: scale(1); }
  25% { transform: scale(1.2); }
  40% { transform: scale(1); }
  60% { transform: scale(1.2); }
}

/* Notification pulse */
@keyframes notification-pulse {
  0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(15, 118, 110, 0.4); }
  50% { transform: scale(1.1); box-shadow: 0 0 0 8px rgba(15, 118, 110, 0); }
}
```

### 2. Classes d'animation

```css
/* Éléments qui montent à l'apparition */
.reveal-up {
  animation: rise 700ms ease forwards;
}

/* Animation de flottement */
.card-animate {
  animation: card-float 11s ease-in-out infinite alternate;
}

/* Points de séparation pulsants */
.separator-dot {
  animation: pulse-dot 3s ease-in-out infinite;
}

/* Shimmer loading */
.skeleton {
  background: linear-gradient(
    90deg,
    oklch(0.9 0.02 80) 25%,
    oklch(0.95 0.02 80) 50%,
    oklch(0.9 0.02 80) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

/* Card shimmer */
.shimmer-card {
  background: linear-gradient(
    135deg,
    oklch(0.95 0.01 80) 0%,
    oklch(0.9 0.02 80) 50%,
    oklch(0.95 0.01 80) 100%
  );
  background-size: 200% 200%;
  animation: shimmer 2s infinite linear;
}

/* FAB animation */
.fab-animate {
  animation: float 3s ease-in-out infinite;
}

/* Page enter */
.page-enter {
  animation: fade-in-up 0.5s ease forwards;
}

/* Heart animate */
.heart-animate {
  animation: heart-beat 0.8s ease-out;
}

/* Notification badge pulse */
.notification-badge {
  animation: notification-pulse 2s infinite;
}
```

### 3. Effets de fond

```css
/* Mesh gradient moderne */
.gradient-mesh {
  background: radial-gradient(
    at 0% 0%, 
    oklch(0.32 0.08 200 / 0.06) 0px, 
    transparent 50%
  ),
  radial-gradient(
    at 100% 100%, 
    oklch(0.78 0.15 45 / 0.05) 0px, 
    transparent 50%
  ),
  radial-gradient(
    at 50% 50%, 
    oklch(0.55 0.12 150 / 0.03) 0px, 
    transparent 60%
  );
}

/* Mesh vert émeraude */
.green-gradient-mesh {
  background: radial-gradient(
    at 0% 0%, 
    oklch(0.55 0.12 150 / 0.15) 0px, 
    transparent 50%
  ),
  radial-gradient(
    at 100% 100%, 
    oklch(0.45 0.1 150 / 0.1) 0px, 
    transparent 50%
  ),
  radial-gradient(
    at 50% 50%, 
    oklch(0.6 0.12 150 / 0.08) 0px, 
    transparent 60%
  );
}

/* Hero gradient radial */
.hero-gradient {
  background: radial-gradient(
    ellipse at center,
    oklch(0.32 0.08 200 / 0.15) 0%,
    transparent 70%
  );
}

/* Green hero background */
.green-hero-bg {
  background: linear-gradient(
    135deg,
    oklch(0.97 0.02 150) 0%,
    oklch(0.93 0.04 150) 50%,
    oklch(0.88 0.05 150) 100%
  );
}
```

### 4. Glassmorphism

```css
/* Glass enhanced */
.glass-enhanced {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.dark .glass-enhanced {
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Fond de page avec motif géométrique */
body::before {
  content: "";
  position: fixed;
  inset: 0;
  background-image:
    linear-gradient(
      120deg, 
      oklch(0.32 0.08 200 / 0.04), 
      oklch(0.55 0.12 150 / 0.03) 50%, 
      transparent 80%
    ),
    repeating-linear-gradient(
      135deg,
      oklch(0.18 0.03 210 / 0.03) 0,
      oklch(0.18 0.03 210 / 0.03) 1px,
      transparent 1px,
      transparent 22px
    );
  opacity: 0.8;
  animation: drift 18s ease-in-out infinite;
  pointer-events: none;
  z-index: 0;
}
```

### 5. Hover effects

```css
/* Scale au hover */
.hover-scale {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.hover-scale:hover {
  transform: scale(1.05);
}

/* Category card hover */
.category-card::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    oklch(0.78 0.15 45 / 0.1) 0%,
    oklch(0.32 0.08 200 / 0.05) 100%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
}
.category-card:hover::after {
  opacity: 1;
}

/* Nav indicator */
.nav-indicator::after {
  content: "";
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 3px;
  background: currentColor;
  border-radius: 2px;
  opacity: 0;
  transition: opacity 0.2s ease;
}
.nav-indicator.active::after {
  opacity: 1;
}
```

---

## Tokens CSS

### Bordures et Rayons

```css
:root {
  --radius: 1.1rem;           /* 17.6px - Cards principales */
  --radius-sm: calc(var(--radius) - 4px);   /* 13.6px */
  --radius-md: calc(var(--radius) - 2px);   /* 15.6px */
  --radius-lg: var(--radius);               /* 17.6px */
  --radius-xl: calc(var(--radius) + 4px);   /* 21.6px */
}

/* Arrondis personnalisés */
.rounded-2xl { border-radius: 1rem; }
.rounded-3xl { border-radius: 1.5rem; }
.rounded-[32px] { border-radius: 2rem; }
.rounded-full { border-radius: 9999px; }   /* Boutons pills */
```

### Ombres

```css
/* Ombres du design system */
.shadow-sm        /* 0 1px 2px 0 rgba(0,0,0,0.05) */
.shadow-md        /* 0 4px 6px -1px rgba(0,0,0,0.1) */
.shadow-lg        /* 0 10px 15px -3px rgba(0,0,0,0.1) */
.shadow-xl        /* 0 20px 25px -5px rgba(0,0,0,0.1) */

/* Ombres personnalisées */
.shadow-[0_12px_40px_rgba(15,23,42,0.12)]  /* Glass card */
.shadow-[0_24px_60px_rgba(15,23,42,0.16)]  /* Card hover */
.shadow-[0_32px_90px_rgba(16,185,129,0.25)] /* Hero cards */
```

### Espacements (Tailwind spacing)

```css
/* Échelle recommandée */
p-2  = 8px    /* Padding très petit */
p-3  = 12px   /* Padding small */
p-4  = 16px   /* Padding medium - standard */
p-6  = 24px   /* Padding large */
p-8  = 32px   /* Padding XL */
px-4 = 16px   /* Padding horizontal */
py-2 = 8px    /* Padding vertical */
gap-2 = 8px   /* Gap small */
gap-4 = 16px  /* Gap medium - standard */
gap-6 = 24px  /* Gap large */
gap-8 = 32px  /* Gap XL */
```

---

## Bonnes pratiques

### 1. Organisation des classes

```tsx
// Ordre recommandé pour les classes Tailwind
<Element
  className="
    /* Layout */
    flex flex-col items-center justify-between
    /* Spacing */
    gap-4 p-6 m-4
    /* Sizing */
    w-full max-w-md
    /* Typography */
    text-center font-semibold
    /* Colors & Background */
    bg-card text-foreground
    /* Borders */
    border border-border rounded-xl
    /* Effects */
    shadow-lg backdrop-blur
    /* Animation */
    transition-all duration-300
    /* States */
    hover:shadow-xl hover:scale-105
  "
/>
```

### 2. Responsive Design

```tsx
// Mobile first - breakpoints Tailwind
/* xs: 475px */
max-w-xs

/* sm: 640px */
sm:text-sm sm:p-4

/* md: 768px */
md:grid md:grid-cols-2 md:p-6

/* lg: 1024px */
lg:text-lg lg:p-8

/* xl: 1280px */
xl:max-w-7xl

/* 2xl: 1536px */
2xl:p-10
```

### 3. Dark mode

```tsx
// Utiliser les variables CSS pour le dark mode
<div className="bg-background text-foreground">
  {/* Automatically adapts to dark mode */}
  <div className="bg-card">
    <p className="text-muted-foreground">
      This text adapts to theme
    </p>
  </div>
</div>

// Classes explicites pour dark mode
<div className="bg-white dark:bg-slate-900">
  <div className="text-gray-900 dark:text-white">
    Texte adaptatif
  </div>
</div>
```

### 4. Accessibilité

```tsx
// Focus visible
<Button className="focus-visible:ring-ring/50 focus-visible:ring-[3px]">
  Action
</Button>

// ARIA labels
<Button aria-label="Basculer le thème">
  <Icon className="w-5 h-5" />
</Button>

// Screen reader only
<span className="sr-only">
  Nombre de notifications: 3
</span>
```

### 5. Réductions d'animation

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## Guide rapide des composants

### Structure de page type

```tsx
export default function Page() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header sticky glass */}
      <Header />
      
      <main className="flex-1">
        {/* Hero avec gradient mesh */}
        <section className="hero-section">
          <div className="green-gradient-mesh">
            {/* Contenu hero */}
          </div>
        </section>
        
        {/* Section avec révélation */}
        <section className="reveal-up">
          <h2>Titre</h2>
          <Card className="card-animate">
            {/* Card content */}
          </Card>
        </section>
      </main>
      
      {/* Footer */}
      <Footer />
      
      {/* Navigation mobile */}
      <BottomNav />
    </div>
  )
}
```

---

## Démarrage rapide

### 1. Importer les styles
```tsx
import "./globals.css"
```

### 2. Utiliser les fonts
```tsx
<body className={`${sora.variable} ${dmSerif.variable} font-sans antialiased`}>
```

### 3. Appliquer les couleurs
```tsx
<div className="bg-background text-foreground min-h-screen">
  <Card className="glass-card">
    <h1 className="display-font text-gradient">
      Titre avec style
    </h1>
  </Card>
</div>
```

---

## Maintenance

### Fichiers sources
- **Styles globaux** : `BonCoin_Front/app/globals.css`
- **Composants UI** : `BonCoin_Front/components/ui/`
- **Layout** : `BonCoin_Front/app/layout.tsx`
- **Design tokens** : `BonCoin_Front/styles/globals.css`

### Mise à jour des couleurs
Modifier les variables dans `:root` et `.dark` dans `globals.css`

### Ajouter une nouvelle variante de bouton
1. Ajouter dans `button.tsx` → `buttonVariants`
2. Documenter dans ce guide

---

* Dernière mise à jour : Janvier 2025
* Version : 1.0

