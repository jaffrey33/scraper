import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'trademe.tmcdn.co.nz',
        pathname: '/photoserver/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'mediaserver.realestate.co.nz',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;
