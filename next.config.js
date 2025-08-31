/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  // Build optimization
  experimental: {
    // Disable build trace collection to prevent stack overflow
    buildTrace: false,
  },
  // Optimize build performance
  swcMinify: true,
  // Reduce bundle size
  compress: true,
}

module.exports = nextConfig
