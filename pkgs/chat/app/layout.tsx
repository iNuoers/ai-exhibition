import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI Exhibition Chat',
  description: '展会智能助手对话',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="h-dvh">{children}</body>
    </html>
  )
}
