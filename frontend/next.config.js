/** @type {import('next').NextConfig} */

const nextConfig = {
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  distDir: 'out',
  
  // Production optimizations
  poweredByHeader: false,
  compress: true,
  
  // Image optimization for static export
  images: {
    unoptimized: true,
    domains: [
      'localhost',
      '127.0.0.1',
      'veer-nirman.web.app',
      'firebase.googleapis.com',
      'firebaseapp.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'veer-nirman.web.app',
      },
      {
        protocol: 'https',
        hostname: '*.firebaseapp.com',
      },
    ],
  },

  // Headers are not supported with static export
  // Security headers will be handled by Firebase Hosting
  
  // Development settings
  ...(process.env.NODE_ENV === 'development' && {
    allowedDevOrigins: [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://192.168.1.8:3000',
      'http://172.17.101.234:3000',
    ],
  }),
  
  // Rewrites disabled for static export
  // async rewrites() {
  //   return [
  //     {
  //       source: '/_next/:path*',
  //       destination: 'http://localhost:3000/_next/:path*',
  //     },
  //   ]
  // },
}

module.exports = nextConfig
