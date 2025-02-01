/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
    ],
  },
  webpack(config, { isServer }) {
    if (isServer) {
      config.externals = {
        mercadopago: "mercadopago",
      };
    }
    return config;
  },
};

module.exports = nextConfig;
