import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Scarborough Commercial Real Estate - Listing Management",
  description:
    "Professional commercial real estate listing management platform for Scarborough Commercial Real Estate LLC",
  icons: {
    icon: "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcTirZvs6mwvxX4xSRx9pPSYetcWbXdcuqs_o5hVVBk1e_BGdj6Q",
    apple: "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcTirZvs6mwvxX4xSRx9pPSYetcWbXdcuqs_o5hVVBk1e_BGdj6Q",
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
