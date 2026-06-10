import type { Metadata, Viewport } from 'next'
import { Toaster } from 'react-hot-toast'
import { GoogleAnalytics } from '@next/third-parties/google'
import './globals.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Prevents auto-zooming on inputs
}

export const metadata: Metadata = {
  title: {
    default: 'PredictCup 2026 — FIFA World Cup Prediction Platform',
    template: '%s | PredictCup 2026',
  },
  description:
    'Predict FIFA World Cup 2026 match results, compete on global leaderboards, and share your predictions with friends. The ultimate fan prediction platform.',
  keywords: ['FIFA World Cup 2026', 'prediction', 'football', 'soccer', 'leaderboard', 'fantasy'],
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>⚽</text></svg>', type: 'image/svg+xml' },
    ],
    apple: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>⚽</text></svg>',
  },
  openGraph: {
    title: 'PredictCup 2026 — FIFA World Cup Prediction Platform',
    description: 'Predict match results, compete on leaderboards, and share your World Cup predictions.',
    type: 'website',
    siteName: 'PredictCup 2026',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PredictCup 2026',
    description: 'The ultimate World Cup prediction platform. Join millions of fans!',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body style={{ overflowX: 'hidden', width: '100%', WebkitTextSizeAdjust: '100%' }}>
        <div style={{ position: 'relative', zIndex: 1, width: '100%', overflowX: 'hidden' }}>
          {children}
        </div>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#0d1526',
              color: '#f1f5f9',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              fontFamily: 'Outfit, sans-serif',
              fontSize: '0.9rem',
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: '#0d1526' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#0d1526' },
            },
          }}
        />
        {/* Replace G-XXXXXXXXXX with your actual Google Analytics Measurement ID */}
        <GoogleAnalytics gaId="G-XXXXXXXXXX" />
      </body>
    </html>
  )
}
