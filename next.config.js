/** @type {import('next').NextConfig} */
const nextConfig = {
  // Type and lint errors fail the build
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

module.exports = nextConfig;
