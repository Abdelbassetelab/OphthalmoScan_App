'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, Check, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { resetPassword, updatePassword } from '@/lib/auth/supabase-auth';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/database.types';

// Password validation function in accordance with Supabase recommendations
function validatePassword(password: string): { valid: boolean; message: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  
  // Check for uppercase letter
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  
  // Check for lowercase letter
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  
  // Check for number
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  
  return { valid: true, message: '' };
}

// Password strength indicator component
const PasswordStrengthIndicator = ({ password }: { password: string }) => {
  // Calculate strength score (0-4)
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  
  // Map score to label and color
  // Ensure score is within bounds (0-4)
  score = Math.max(0, Math.min(4, score));
  
  const strength = [
    { label: 'Very Weak', color: 'bg-red-500', width: '20%' },
    { label: 'Weak', color: 'bg-orange-500', width: '40%' },
    { label: 'Medium', color: 'bg-yellow-500', width: '60%' },
    { label: 'Strong', color: 'bg-lime-500', width: '80%' },
    { label: 'Very Strong', color: 'bg-green-500', width: '100%' }
  ][score];
  
  return (
    <div className="mt-2">
      <div className="flex justify-between text-xs mb-1">
        <span>Password Strength</span>
        <span>{strength?.label || 'None'}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`${strength?.color || 'bg-gray-300'} h-2 rounded-full transition-all duration-300`} 
          style={{ width: strength?.width || '0%' }}
        ></div>
      </div>
    </div>
  );
};

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'request' | 'reset'>('request');
  const [success, setSuccess] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState<{ valid: boolean; message: string }>({ valid: true, message: '' });

  // Check if we have a reset token in the URL and exchange it for a session
  useEffect(() => {
    const handleTokenExchange = async () => {
      // Check for token or access_token in URL
      if (searchParams?.has('token') || window.location.hash.includes('access_token')) {
        setMode('reset');
        
        try {
          // Get the hash fragment which may contain the access token
          const supabase = createClientComponentClient<Database>();
          
          // Exchange the token for a session if present
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Session error:', error);
            setError('Invalid or expired reset token. Please try again.');
            setMode('request');
          } else if (data.session) {
            console.log('Session successfully retrieved');
          }
        } catch (err) {
          console.error('Token exchange error:', err);
          setError('An error occurred processing your reset token.');
          setMode('request');
        }
      }
    };
    
    handleTokenExchange();
  }, [searchParams]);

  // Validate password on change
  useEffect(() => {
    if (password) {
      setPasswordValidation(validatePassword(password));
    } else {
      setPasswordValidation({ valid: true, message: '' });
    }
  }, [password]);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const { error } = await resetPassword(email);
      
      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        setMessage('Password reset link sent to your email');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Password reset error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    // Check password validity
    const validation = validatePassword(password);
    if (!validation.valid) {
      setError(validation.message);
      return;
    }
    
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const { error } = await updatePassword(password);
      
      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        setMessage('Your password has been successfully reset');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Password update error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Request password reset form
  const RequestResetForm = () => (
    <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Reset Your Password</h1>
        <p className="mt-2 text-gray-600">Enter your email to receive a password reset link</p>
      </div>

      {error && (
        <div className="p-3 flex items-center text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
          <AlertTriangle className="h-4 w-4 mr-2" />
          {error}
        </div>
      )}

      {success ? (
        <div className="p-4 rounded-md bg-green-50 border border-green-200">
          <div className="flex">
            <Check className="h-5 w-5 text-green-500 mr-2" />
            <p className="text-sm text-green-700">{message}</p>
          </div>
          <div className="mt-4 text-center">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Return to Login
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleRequestReset} className="mt-8 space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full px-3 py-2 mt-1 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </div>

          <div className="text-center">
            <Link href="/login" className="text-sm font-medium text-blue-600 hover:text-blue-500">
              Back to Login
            </Link>
          </div>
        </form>
      )}
    </div>
  );

  // Reset password form (when token is present)
  const ResetForm = () => (
    <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Create New Password</h1>
        <p className="mt-2 text-gray-600">Enter your new password below</p>
      </div>

      {error && (
        <div className="p-3 flex items-center text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
          <AlertTriangle className="h-4 w-4 mr-2" />
          {error}
        </div>
      )}

      {success ? (
        <div className="p-4 rounded-md bg-green-50 border border-green-200">
          <div className="flex">
            <Check className="h-5 w-5 text-green-500 mr-2" />
            <p className="text-sm text-green-700">{message}</p>
          </div>
          <div className="mt-4 text-center">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Go to Login
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleResetPassword} className="mt-8 space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`block w-full px-3 py-2 mt-1 placeholder-gray-400 border ${
                !passwordValidation.valid && password ? 'border-red-300' : 'border-gray-300'
              } rounded-md shadow-sm appearance-none focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              placeholder="Enter new password"
            />
            {password && <PasswordStrengthIndicator password={password} />}
            <ul className="mt-1 text-xs text-gray-500 list-disc pl-5">
              <li className={password.length >= 8 ? 'text-green-600' : ''}>
                At least 8 characters long
              </li>
              <li className={/[A-Z]/.test(password) ? 'text-green-600' : ''}>
                At least one uppercase letter
              </li>
              <li className={/[a-z]/.test(password) ? 'text-green-600' : ''}>
                At least one lowercase letter
              </li>
              <li className={/[0-9]/.test(password) ? 'text-green-600' : ''}>
                At least one number
              </li>
            </ul>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`block w-full px-3 py-2 mt-1 placeholder-gray-400 border ${
                password !== confirmPassword && confirmPassword 
                  ? 'border-red-300' 
                  : 'border-gray-300'
              } rounded-md shadow-sm appearance-none focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              placeholder="Confirm new password"
            />
            {password !== confirmPassword && confirmPassword && (
              <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading || !passwordValidation.valid || password !== confirmPassword}
              className="flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Reset Password'
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );

  return (
    <div className="flex items-center justify-center min-h-screen py-12 bg-gray-50">
      {mode === 'request' ? <RequestResetForm /> : <ResetForm />}
    </div>
  );
}