import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  devIndicators: false,
  allowedDevOrigins: ["http://localhost:3000"], 
};

export default nextConfig;
