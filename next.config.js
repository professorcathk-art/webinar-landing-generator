/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  // Optimize build performance
  swcMinify: true,
  // Reduce bundle size
  compress: true,
  // Disable build trace collection to prevent stack overflow
  outputFileTracingExcludes: {
    '*': [
      'node_modules/**',
    ],
  },
}

module.exports = nextConfig
