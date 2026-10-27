/** @type {import('next').NextConfig} */
const nextConfig = {
  // Type errors fail the build; lint runs in the build script (npm run lint)
  typescript: {
    ignoreBuildErrors: false,
  },
};

module.exports = nextConfig;
