// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: true,
//   env: {
//     NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
//     NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
//   },
//   images: {
//     domains: ['placehold.co'],
//     dangerouslyAllowSVG: true,
//   },
// };

// export default nextConfig;
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  },
  images: {
    domains: ['placehold.co','your-domain.com'],
    dangerouslyAllowSVG: true,
  },
  experimental: {
    serverActions: true,
    serverComponentsExternalPackages: ['sharp', 'fs-extra'],
  },
  webpack: (config) => {
    config.resolve.fallback = { 
      fs: false, 
      path: false, 
      stream: false, 
      constants: false 
    };
    return config;
  },
  api: {
    bodyParser: false,
  },
};

export default nextConfig;