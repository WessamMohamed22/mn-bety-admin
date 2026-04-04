import type { NextConfig } from "next";

// const backendOrigin = (process.env.BACKEND_ORIGIN || "http://localhost:4000").replace(/\/$/, "");

const backendOrigin = (process.env.BACKEND_ORIGIN || "https://mn-bety-server-production.up.railway.app").replace(/\/$/, "");

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendOrigin}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;