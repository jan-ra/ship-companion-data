import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: '/ship-companion-data',
  assetPrefix: '/ship-companion-data',
  images: {
    unoptimized: true
  }
};

export default nextConfig;
