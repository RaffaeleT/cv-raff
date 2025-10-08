import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "export",           // genera sito statico in /out
  images: { unoptimized: true } // utile per export puro
};

export default nextConfig;
