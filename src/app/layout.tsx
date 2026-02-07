import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Thinking Agents - 5 Perspektiven für bessere Entscheidungen',
  description: 'KI-gestützte Multi-Perspektiven-Analyse für strategische Entscheidungen',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
