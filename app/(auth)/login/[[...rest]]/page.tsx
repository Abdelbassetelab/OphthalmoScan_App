'use client';

import { SignIn } from '@clerk/nextjs';
import { useAuth, useUser } from '@clerk/nextjs';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { isSignedIn } = useAuth();
  const { user, isLoaded } = useUser();
  const router = useRouter();

  // Redirect users to dashboard after login
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push('/dashboard');
    }
  }, [isLoaded, isSignedIn, router]);

  return (
    <div className="flex items-center justify-center min-h-screen py-12 bg-gray-50">
      <SignIn path="/login" routing="path" signUpUrl="/register" afterSignInUrl="/dashboard" />
    </div>
  );
}