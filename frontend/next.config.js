const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimizations
  compress: true,
  poweredByHeader: false,
  // Allowed dev origins for loading _next assets when accessed from LAN devices.
  // Add your local network origin (including port) if you access the dev server remotely.
  allowedDevOrigins: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://10.187.92.96:3000',
    'http://172.16.5.219:3001',
    'http://172.16.5.219:3000'
  ],
  
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: '**.youtube.com',
      },
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      }
    ],
    formats: ['image/webp', 'image/avif'],
    unoptimized: false,
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            // Allow camera in development for local proctoring; keep restrictive in production
            value: process.env.NODE_ENV === 'development'
              ? 'camera=(self "http://127.0.0.1:3000" "http://localhost:3000"), microphone=(), autoplay=(), encrypted-media=()'
              : 'camera=(), microphone=(), geolocation=(), autoplay=(), encrypted-media=()',
          },
        ],
      },
    ];
  },
  
  // Environment-specific settings
  eslint: {
    ignoreDuringBuilds: process.env.NODE_ENV === 'production',
  },
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === 'production',
  },
  
  // Build optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Output configuration
  
  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  
  // Webpack configuration
  webpack: (config, { dev, isServer }) => {
    // Production optimizations
    if (!dev && !isServer) {
      config.optimization.splitChunks.chunks = 'all';
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10,
        },
      };
    }
    
    return config;
  },
};

module.exports = nextConfig;

