import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from './providers'
import CosmicBackground from '@/components/CosmicBackground'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'

export const metadata: Metadata = {
  title: 'LoanTrader - AI-Powered Platform',
  description: 'AI-Powered Transparent Loan Trading Platform with Blockchain',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <CosmicBackground />
          <Sidebar />
          <div className="lg:pl-64">
            <TopBar />
            <main className="min-h-screen p-4 lg:p-8">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
