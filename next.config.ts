import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true,
  },
  async redirect(){
    return[
      {
      source:"/",
      destination:"/meetings",
      permanent:false,
    }
    ];
  },
};

export default nextConfig;
