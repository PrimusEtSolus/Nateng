import type React from "react"
import type { Metadata } from "next"
import { Nunito_Sans, Source_Serif_4 } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-nunito",
})

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-serif",
})

export const metadata: Metadata = {
  title: "NatengHub - Fresh Vegetables From Benguet Farmers",
  description:
    "Connect directly with Benguet farmers for fresh, wholesale vegetables. Buy, sell, and manage your agricultural business.",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${nunitoSans.className} ${sourceSerif.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
