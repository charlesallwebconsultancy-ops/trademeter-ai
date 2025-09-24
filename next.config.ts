import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  eslint: {
    // 🚨 this disables ESLint checks during builds
    ignoreDuringBuilds: true,
  },
}

export default nextConfig
