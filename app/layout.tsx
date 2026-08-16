import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sample Room Management',
  description: 'Sistem Manajemen Sample Room ROMAN & QUADRA',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className="bg-slate-50 text-slate-900 antialiased min-h-screen">
        {children}
      </body>
    </html>
  )
}