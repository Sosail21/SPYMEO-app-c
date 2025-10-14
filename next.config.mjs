// next.config.mjs
// Cdw-Spm: Configuration Next.js SPYMEO V1
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Production: output standalone pour Docker
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,

  // Compression
  compress: true,

  // typedRoutes désactivé temporairement pour V1.0 (réactiver en V1.1 polish)
  // experimental: { typedRoutes: true },

  // Images optimization
  images: {
    domains: ['spymeo-production-assets.s3.eu-west-3.amazonaws.com'],
    formats: ['image/webp', 'image/avif'],
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
        ],
      },
    ];
  },
};
export default nextConfig;