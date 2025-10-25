/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable image optimization to serve images as static files
  // This ensures images work correctly on Netlify
  images: {
    unoptimized: true,
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
