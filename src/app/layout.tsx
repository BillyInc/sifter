import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Sifter 1.0 - Project Due Diligence',
  description: 'Analyze crypto projects for potential risks and red flags',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}

<nav className="border-b border-sifter-border p-4">
  <div className="flex gap-6">
    <a href="/" className="text-gray-400 hover:text-white">Home</a>
    <a href="/disputes" className="text-gray-400 hover:text-white">Public Disputes</a>
    <a href="/terms" className="text-gray-400 hover:text-white">Terms</a>
  </div>
</nav>