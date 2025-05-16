'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, Check, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { supabaseAuth } from '@/lib/auth/supabase-auth';

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Get the Supabase callback URL from search params
        const token_hash = searchParams?.get('token_hash');
        const type = searchParams?.get('type');
        
        if (token_hash && type) {
          const { error } = await supabaseAuth.auth.verifyOtp({
            token_hash,
            type: type as any,
          });

          if (error) {
            setError(error.message);
          } else {
            setVerified(true);
          }
        } else {
          setError('Missing verification parameters');
        }
      } catch (err) {
        console.error('Verification error:', err);
        setError('An unexpected error occurred during verification');
      } finally {
        setIsLoading(false);
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-12 bg-gray-50">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Verifying Your Email</h1>
            <div className="flex justify-center mt-4">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
            <p className="mt-4 text-gray-600">Please wait while we verify your email...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-12 bg-gray-50">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">Verification Failed</h1>
            <div className="flex justify-center mt-4">
              <AlertTriangle className="w-10 h-10 text-red-600" />
            </div>
            <p className="mt-4 text-red-600">{error}</p>
            <div className="mt-8">
              <Link
                href="/login"
                className="inline-block px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Go to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-green-600">Email Verified</h1>
          <div className="flex justify-center mt-4">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <p className="mt-4 text-gray-600">
            Your email has been successfully verified. You can now log in to your account.
          </p>
          <div className="mt-8">
            <Link
              href="/login"
              className="inline-block px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}