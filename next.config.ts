import type { NextConfig } from 'next';

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  serverExternalPackages: [
    'liquidjs',
    '@aws-sdk/client-acm',
    '@aws-sdk/client-bedrock-runtime',
    '@aws-sdk/client-cloudfront',
    '@aws-sdk/client-s3',
    '@aws-sdk/client-ses',
    '@aws-sdk/s3-request-presigner',
    'chokidar',
    '@polar-sh/sdk',
    'dotenv',
    'axios',
    'node-fetch',
  ],
  images: {
    // Configuración para imágenes locales
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",

    // Configuración para desarrollo
    unoptimized: process.env.APP_ENV === 'development',

    // Configuración para imágenes locales según documentación oficial
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
    ],
  },
  experimental: {
    viewTransition: true,
    optimizePackageImports: [
      '@radix-ui/react-accordion',
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-avatar',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-icons',
      '@radix-ui/react-label',
      '@radix-ui/react-navigation-menu',
      '@radix-ui/react-popover',
      '@radix-ui/react-select',
      '@radix-ui/react-separator',
      '@radix-ui/react-slot',
      '@radix-ui/react-tabs',
      '@radix-ui/react-tooltip',
      '@shopify/polaris',
      '@shopify/react-form',
      '@tailwindcss/postcss',
      '@tanstack/react-query',
      '@types/jsonwebtoken',
      'aws-amplify',
      'class-variance-authority',
      'clsx',
      'date-fns',
      'framer-motion',
      'gsap',
      'input-otp',
      'jsonwebtoken',
      'lucide-react',
      'framer-motion',
      'recharts',
      'date-fns',
      'clsx',
      'tailwind-merge',
    ],
  },
};

module.exports = nextConfig;
