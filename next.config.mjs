/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // Proxy des images vers Laravel pour éviter les problèmes CORS
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
    const backendUrl = apiUrl.replace('/api', '');
    
    return [
      {
        source: '/storage/:path*',
        destination: `${backendUrl}/storage/:path*`,
      },
    ]
  },
  images: {
    // Optimisation des images - configuration pour la production
    unoptimized: false,
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/storage/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/storage/**',
      },
    ],
  },
  // Optimisation de la compilation
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Activer la compression
  compress: true,
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
    ]
  },
  // Headers de sécurité et performance
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
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
      {
        source: '/:path*.(js|css|woff|woff2|ttf|eot)$',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:path*.(jpg|jpeg|png|gif|ico|svg|webp|avif)$',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400',
          },
        ],
      },
    ]
  },
}

export default nextConfig
