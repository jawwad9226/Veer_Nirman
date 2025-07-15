import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { FirebaseAuthProvider } from './components/FirebaseAuthProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'VEER NIRMAN 2.0',
  description: 'Valor & Excellence Training Platform for NCC Cadets',
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <FirebaseAuthProvider>
          {children}
        </FirebaseAuthProvider>
      </body>
    </html>
  )
}
