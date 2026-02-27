/** @type {import('next').NextConfig} */
const nextConfig = {
  // export static HTML so the front end can be hosted on a simple file server
  output: 'export',
  // images must be unoptimized when using `next export` (no image server)
  images: {
    unoptimized: true,
  },
};

export default nextConfig;