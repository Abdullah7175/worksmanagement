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

//next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    JWT_SECRET: process.env.JWT_SECRET, // ✅ Add this line
  },
  images: {
    domains: ['placehold.co','localhost'],
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