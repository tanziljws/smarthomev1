import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import Providers from './Providers'
import RootLayoutClient from './RootLayoutClient' 
import LoadingBar from '@/components/LoadingBar'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const navigation = [
  { name: 'Dashboard', href: '/' },
  { name: 'Devices', href: '/devices' },
  { name: 'Scan Devices', href: '/devices/new' },
  // ... menu lainnya ...
]

export const metadata = {
  title: "Smart Home Dashboard",
  description: "Dashboard for managing smart home devices and CCTV",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <LoadingBar />
          <RootLayoutClient>
            {children}
          </RootLayoutClient>
        </Providers>
      </body>
    </html>
  )
}
