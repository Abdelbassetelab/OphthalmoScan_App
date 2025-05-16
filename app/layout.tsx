import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import React from 'react';
import '@/styles/globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'OphthalmoScan-AI',
  description: 'Ophthalmology diagnostic support system powered by AI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ClerkProvider>
          <main>
            {children}
          </main>
          <Toaster />
        </ClerkProvider>
      </body>
    </html>
  );
}