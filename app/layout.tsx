import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import React from 'react';
import '@/styles/globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/context/auth-context';
import StyledComponentsProvider from '@/components/ui/StyledComponentsProvider';
import dynamic from 'next/dynamic';

// Dynamically import the chatbot component to avoid SSR issues with styled-components
const AssistantChatbot = dynamic(
  () => import('@/components/ui/AssistantChatbot'),
  { ssr: false }
);

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'OphthalmoScan-AI',
  description: 'Ophthalmology diagnostic support system powered by AI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ClerkProvider>
          <StyledComponentsProvider>
            <main>
              {children}
            </main>
            <AssistantChatbot />
            <Toaster />
          </StyledComponentsProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}