import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["10.130.206.213"],

  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;