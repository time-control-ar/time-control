import { Inter } from 'next/font/google'
import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from 'next-themes'
import { SessionProvider } from 'next-auth/react'

export const metadata: Metadata = {
  title: "Time Control",
};

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  style: ['normal'],
})

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {


  return (
    <html lang="en" className={`${inter.className} antialiased`} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body>
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}