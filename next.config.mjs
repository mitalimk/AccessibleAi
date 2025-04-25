/** @type {import('next').NextConfig} */
// D:/Mrunal/HACK AI/hack-ai/next.config.mjs
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/data/:path*',
        destination: '/api/static/:path*',
      },
    ];
  },
  images: {
    domains: ['via.placeholder.com'],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
