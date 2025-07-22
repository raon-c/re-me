import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: '모바일 청첩장',
  description: '스마트폰으로 쉽게 만드는 디지털 청첩장',
  keywords: ['청첩장', '모바일', '디지털', '결혼식'],
  authors: [{ name: '모바일 청첩장 팀' }],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={inter.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
