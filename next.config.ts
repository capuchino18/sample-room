if (typeof (global as any).__dirname === 'undefined') {
  (global as any).__dirname = process.cwd();
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // Tambahkan baris ini untuk mengubah mode output
  output: 'standalone',
};

export default nextConfig;