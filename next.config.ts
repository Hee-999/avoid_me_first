import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Loopback preview uses IPv6 because another local app occupies IPv4 port 3000.
  allowedDevOrigins: ["[::1]"],
  experimental: {
  }
};

export default nextConfig;
