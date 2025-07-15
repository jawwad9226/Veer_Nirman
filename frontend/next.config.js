/** @type {import('next').NextConfig} */

// To allow cross-origin requests from LAN/mobile devices in dev, add their full origin (protocol, IP, port) below.
// Example: 'http://192.168.1.100:3000', 'http://10.0.0.5:3000', etc.
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  distDir: 'out',
  allowedDevOrigins: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://192.168.1.8:3000',
    'http://172.17.101.234:3000',
    // Add more origins as needed for your LAN/mobile devices:
    // 'http://192.168.1.100:3000',
    // 'http://10.0.0.5:3000',
  ],
  images: {
    unoptimized: true,
    domains: ['localhost', '127.0.0.1', '192.168.1.8', '172.17.101.234'],
  },
  async rewrites() {
    return [
      {
        source: '/_next/:path*',
        destination: 'http://localhost:3000/_next/:path*',
      },
    ]
  },
}

module.exports = nextConfig
