import type { NextConfig } from 'next';

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  serverExternalPackages: [
    '@aws-sdk/client-acm',
    '@aws-sdk/client-bedrock-runtime',
    '@aws-sdk/client-cloudfront',
    '@aws-sdk/client-s3',
    '@aws-sdk/client-ses',
    '@aws-sdk/s3-request-presigner',
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
  },
};

module.exports = nextConfig;
