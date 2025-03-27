import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Resonance Deck Builder',
  description: 'Created with lots of AI',
  generator: 'ralf',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
