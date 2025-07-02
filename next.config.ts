/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure domains for image optimization
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
