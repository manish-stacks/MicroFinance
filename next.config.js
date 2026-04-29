/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV === "development";
const nextConfig = {
  images: {
    domains: ['res.cloudinary.com', 'localhost'],
  },
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs'],
  },
  typescript: {
    ignoreBuildErrors: !isDev,
  },

  eslint: {
    ignoreDuringBuilds: !isDev,
  },
};

module.exports = nextConfig;
