/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  // Optimize build performance
  swcMinify: true,
  // Reduce bundle size
  compress: true,
  // Disable build trace collection completely
  experimental: {
    buildTrace: false,
  },
  // Skip build trace collection
  outputFileTracing: false,
}

module.exports = nextConfig
