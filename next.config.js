/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  // Optimize build performance
  swcMinify: true,
  // Reduce bundle size
  compress: true,
  // Disable static optimization for problematic pages
  experimental: {
    // Disable static generation for pages that might cause issues
    staticPageGenerationTimeout: 0,
  },
}

module.exports = nextConfig
