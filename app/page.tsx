'use client';

import Link from 'next/link';
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton, useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Home() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const [showFallback, setShowFallback] = useState(false);
  
  // Show fallback buttons if Clerk doesn't load within 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isLoaded) setShowFallback(true);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [isLoaded]);
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm flex flex-col">
        <h1 className="text-4xl font-bold mb-8">Welcome to OphthalmoScan-AI</h1>
        <p className="text-xl mb-8">An ophthalmology diagnostic support system powered by AI</p>
        
        {/* Clerk authentication components */}
        <SignedOut>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <SignInButton mode="modal">
              <button className="group bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded text-center transition-colors duration-300 w-full">
                Login with Clerk
              </button>
            </SignInButton>
            
            <SignUpButton mode="modal">
              <button className="group bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded text-center transition-colors duration-300 w-full">
                Register with Clerk
              </button>
            </SignUpButton>
          </div>
        </SignedOut>
        
        {/* Fallback buttons or direct links */}
        {(!isLoaded || showFallback) && !isSignedIn && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link 
              href="/login" 
              className="group bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded text-center transition-colors duration-300"
            >
              Login (Fallback)
            </Link>
            <Link 
              href="/register" 
              className="group bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded text-center transition-colors duration-300"
            >
              Register (Fallback)
            </Link>
          </div>
        )}
        
        <SignedIn>
          <div className="mt-8 flex flex-col items-center gap-6">
            <div className="flex items-center gap-4">
              <p className="text-lg">Welcome back!</p>
              <UserButton afterSignOutUrl="/" />
            </div>
            
            <button 
              onClick={() => router.push('/dashboard/patient')}
              className="group bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded text-center transition-colors duration-300"
            >
              Go to Dashboard
            </button>
          </div>
        </SignedIn>
        
        {/* Debug info */}
        <div className="mt-8 text-xs text-gray-500">
          <p>Clerk loaded: {isLoaded ? 'Yes' : 'No'}</p>
          <p>Signed in: {isSignedIn ? 'Yes' : 'No'}</p>
        </div>
      </div>
    </main>
  );
}