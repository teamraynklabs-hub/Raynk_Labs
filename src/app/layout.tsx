import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/theme/theme-provider'
import AlertProvider from '@/components/cards/AlertProvider'
import ClientLayout from './ClientLayout'
import { Cormorant_Garamond, Inter } from 'next/font/google'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-heading',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-body',
})

export const metadata: Metadata = {
  title: 'RaYnk Labs — Learn • Earn • Grow • Innovate',
  description:
    'A student-led innovation lab building tools, education, and opportunities for youth.',
  keywords:
    'student innovation, tech education, career guidance, web development, AI tools',
  icons: {
    icon: '/images/logos.png',
  },
  authors: [{ name: 'RaYnk Labs Team' }],
  openGraph: {
    title: 'RaYnk Labs — Learn • Earn • Grow • Innovate',
    description:
      'A student-led innovation lab building tools, education, and opportunities for youth.',
    type: 'website',
  },
}

/* ---------- Viewport ---------- */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

/* ---------- Root Layout ---------- */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${cormorant.variable} ${inter.variable} antialiased`}>
        <AlertProvider>
          <ThemeProvider>
            <ClientLayout>{children}</ClientLayout>
          </ThemeProvider>
        </AlertProvider>
      </body>
    </html>
  )
}
