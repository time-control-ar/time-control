import type { NextConfig } from "next";

const nextConfig: NextConfig = {
 /* config options here */
 images: {
  remotePatterns: [
   {
    protocol: "https",
    hostname: "www.timecontrolonline.com.ar",
   },
  ],
 },
};

export default nextConfig;
