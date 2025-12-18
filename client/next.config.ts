import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'static2.finnhub.io',      // ← allow images from here
      'image.cnbcfm.com',
      'data.bloomberglp.com',
      'fm.cnbc.com'
      // add any other hosts you need, e.g.:
      // 'example.com',
    ],
  },
};

export default nextConfig;
//tatic2.finnhub.io