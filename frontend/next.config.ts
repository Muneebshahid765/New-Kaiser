import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/uploads/**',
      },
      // Production pe:
      // { protocol: 'https', hostname: 'yourdomain.com', pathname: '/uploads/**' }
    ],
  },
};

export default nextConfig;
