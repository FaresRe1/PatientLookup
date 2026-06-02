import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  webpack: (config) => {
    // Fix Windows case-insensitive filesystem path normalization.
    // Without this, webpack resolves the same node_modules from both
    // "App" and "app" paths, loading two copies of React and crashing.
    config.resolve = {
      ...config.resolve,
      symlinks: false,
    };
    config.snapshot = {
      ...config.snapshot,
      managedPaths: [path.resolve(__dirname, 'node_modules')],
    };
    return config;
  },
};

export default nextConfig;
