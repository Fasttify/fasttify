/** @type {import('next').NextConfig} */
const nextConfig = {
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
};

module.exports = nextConfig;
