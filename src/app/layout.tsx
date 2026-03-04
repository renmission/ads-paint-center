import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'ADS Paint Center IMS',
    template: '%s | ADS Paint Center',
  },
  description:
    'ADS Paint Center Integrated Management System with SMS Notification — Sto. Tomas, Batangas',
  keywords: ['paint center', 'inventory', 'management', 'POS', 'SMS'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
