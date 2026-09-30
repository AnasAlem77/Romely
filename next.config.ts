import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // السماح لأي نطاق في العالم بالعمل فوراً بدون استثناءات
      },
    ],
  },
};

export default nextConfig;