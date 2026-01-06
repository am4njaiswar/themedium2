// app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SocketProvider } from '@/context/SocketContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Communication Evolution Simulator',
  description: 'Experience messaging through different eras of communication technology',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-linear-to-br from-gray-900 to-blue-950 min-h-screen`}>
        <SocketProvider>{children}</SocketProvider>
      </body>
    </html>
  )
}