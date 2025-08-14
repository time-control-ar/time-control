import type { NextConfig } from "next";

const nextConfig: NextConfig = {
 /* config options here */
 images: {
  remotePatterns: [
   {
    protocol: "https",
    hostname: "vlgjuzcoyyoajuil.public.blob.vercel-storage.com",
   },
   {
    protocol: "https",
    hostname: "lh3.googleusercontent.com",
   },
  ],
  unoptimized: false,
 },
 webpack: (config, { isServer }) => {
  if (!isServer) {
   // Don't resolve 'fs' module on the client to prevent this error on build --> Error: Can't resolve 'fs'
   config.resolve.fallback = {
    ...config.resolve.fallback,
    fs: false,
    net: false,
    tls: false,
    crypto: false,
    stream: false,
    url: false,
    zlib: false,
    http: false,
    https: false,
    assert: false,
    os: false,
    path: false,
   };
  }
  return config;
 },
};

export default nextConfig;
