import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '3D Portfolio',
  description: 'Interactive 3D portfolio built with Next.js + R3F'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}