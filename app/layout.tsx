import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, Noto_Sans_Math, Source_Serif_4 } from 'next/font/google'
import 'katex/dist/katex.min.css'
import './globals.css'

const notoMath = Noto_Sans_Math({
  subsets: ['math'],
  weight: '400',
  variable: '--font-math',
  display: 'swap',
})

const sourceSerif = Source_Serif_4({
  subsets: ['latin', 'latin-ext', 'greek'],
  variable: '--font-source-serif',
  style: ['normal', 'italic'],
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin', 'latin-ext', 'greek'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'The Block Universe',
    template: '%s · The Block Universe',
  },
  description:
    'The Block Universe — a nonfiction scientific and philosophical manuscript on relativity, the direction of time, quantum mechanics, free will, and time travel. Read online or download the complete PDF.',
  generator: 'v0.app',
  openGraph: {
    title: 'The Block Universe',
    description:
      'A scientific and philosophical manuscript on relativity, the direction of time, quantum mechanics, free will, and time travel.',
    type: 'book',
  },
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#faf7f0',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${sourceSerif.variable} ${inter.variable} ${notoMath.variable}`}>
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
