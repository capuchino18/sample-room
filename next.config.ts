// Menangkal error __dirname di lingkungan Vercel/Serverless
if (typeof (global as any).__dirname === 'undefined') {
  (global as any).__dirname = process.cwd();
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;