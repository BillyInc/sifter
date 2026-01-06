import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Turbopack is now the default bundler in Next.js 16
  // No configuration needed unless you want to customize it

  // Image optimization settings
  images: {
    // Use remotePatterns instead of deprecated 'domains'
    remotePatterns: [
      // Add remote image domains here if needed
      // {
      //   protocol: 'https',
      //   hostname: 'example.com',
      // },
    ],
  },
};

export default nextConfig;
