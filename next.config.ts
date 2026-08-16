// Solusi darurat agar Vercel mengenali __dirname
if (typeof globalThis.__dirname === 'undefined') {
  globalThis.__dirname = process.cwd();
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;