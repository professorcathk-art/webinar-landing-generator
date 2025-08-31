/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  // Optimize build performance
  swcMinify: true,
  // Reduce bundle size
  compress: true,

}

module.exports = nextConfig
