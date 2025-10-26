/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Si vas a usar imágenes externas (S3, etc.) añade dominios aquí
  images: {
    remotePatterns: [
      // ejemplo:
      // { protocol: "https", hostname: "example-bucket.s3.amazonaws.com", pathname: "/**" },
    ],
  },
  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig;
