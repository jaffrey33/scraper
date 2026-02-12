import type { NextConfig } from "next";

const nextConfig: NextConfig = {
   images: {
    remotePatterns: [new URL('https://trademe.tmcdn.co.nz/photoserver/**')],
  },
};

export default nextConfig;
