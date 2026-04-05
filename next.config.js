/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,   // 🔥 THIS FIXES YOUR ISSUE
  images: {
    unoptimized: true,
  },
};

export default nextConfig;