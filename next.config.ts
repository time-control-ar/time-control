import type { NextConfig } from "next";

const nextConfig: NextConfig = {
 /* config options here */
 images: {
  remotePatterns: [
   {
    protocol: "https",
    hostname: "www.timecontrolonline.com.ar",
   },
   {
    protocol: "https",
    hostname: "lh3.googleusercontent.com",
   },
  ],
 },
};

export default nextConfig;
