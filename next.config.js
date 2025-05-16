/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: true,
  },
  images: {
    domains: ['localhost', 'img.clerk.com'],
    // Add other domains here once you have Supabase storage or other image sources set up
  },
  webpack: (config) => {
    // Add polyfills for Node.js core modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      buffer: require.resolve('buffer/'),
    };
    return config;
  },
};

module.exports = nextConfig;