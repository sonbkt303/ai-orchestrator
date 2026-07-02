import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@clever-dent/shared-contracts', '@clever-dent/shared-utils'],
};

export default nextConfig;
