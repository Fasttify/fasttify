import type { NextConfig } from 'next';

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  reactCompiler: true,
  typescript: {
    ignoreBuildErrors: true,
  },

  transpilePackages: [
    '@fasttify/liquid-forge',
    '@fasttify/tenant-domains',
    '@fasttify/orders-app',
    '@fasttify/theme-editor',
  ],

  serverExternalPackages: [
    '@aws-sdk/client-acm',
    '@aws-sdk/client-bedrock-runtime',
    '@aws-sdk/client-cloudfront',
    '@aws-sdk/client-s3',
    '@aws-sdk/client-ses',
    '@aws-sdk/s3-request-presigner',
    'dotenv',
    'axios',
    'node-fetch',
  ],

  images: {
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",

    unoptimized: false,

    qualities: [25, 50, 75, 85, 90, 95, 100],

    localPatterns: [
      {
        pathname: '/icons/**',
      },
      {
        pathname: '/api/stores/**',
      },
      {
        pathname: '/**',
      },
    ],

    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      {
        protocol: 'https',
        hostname: '*.s3.*.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*cdn.fasttify.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'drive.google.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'photos.google.com',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
};

module.exports = nextConfig;
