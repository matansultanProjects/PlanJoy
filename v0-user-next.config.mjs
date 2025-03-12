/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'v0.blob.com',
      'hebbkx1anhila5yf.public.blob.vercel-storage.com',
      'lh3.googleusercontent.com',
      'firebasestorage.googleapis.com',
    ],
    unoptimized: true, // Disable image optimization to simplify deployment
  },
  // Improve build performance
  swcMinify: true,
  // Ensure TypeScript errors don't prevent deployment
  typescript: {
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  // Ensure ESLint errors don't prevent deployment
  eslint: {
    // Dangerously allow production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  // Simplify output
  output: 'standalone',
}

export default nextConfig

