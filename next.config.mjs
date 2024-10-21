/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: "tokens.1inch.io" },
      { hostname: "assets.coingecko.com" },
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('web-worker');  // Ensure it doesn't try to bundle web-worker on the server
    }

    return config;
  }
};

export default nextConfig;
