/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Redirections personnalisées
  async redirects() {
    return [
      // Redirection vers la page d'accueil pour les routes racine alternatives
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
      // Redirection des anciennes routes d'annonces
      {
        source: '/annonce/:slug',
        destination: '/listings/:slug',
        permanent: true,
      },
      // Redirection vers la liste des annonces
      {
        source: '/ads',
        destination: '/listings',
        permanent: true,
      },
      // Redirection des routes de recherche
      {
        source: '/search',
        destination: '/listings',
        permanent: true,
      },
      // Redirection vers les messages
      {
        source: '/inbox',
        destination: '/messages',
        permanent: true,
      },
      // Suppression des trailing slashes (optionnel - décommenter si nécessaire)
      // {
      //   source: '/:path*/',
      //   destination: '/:path*',
      //   permanent: true,
      // },
    ]
  },
  // Headers de sécurité
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

export default nextConfig
