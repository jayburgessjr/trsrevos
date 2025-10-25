/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Configure image domains and formats
    formats: ['image/avif', 'image/webp'],
    // Disable image optimization for Netlify (Netlify handles it via plugin)
    // Set to true if you want Next.js to handle optimization
    unoptimized: false,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't bundle Node.js-only modules on the client side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
        path: false,
        os: false,
        util: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
