import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@clever-dent/shared-contracts'],
};

export default nextConfig;
