'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signInWithEmailAndPassword } from '@/lib/auth/supabase-auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Check for success/error messages from redirect
  const error = searchParams.get('error');
  const success = searchParams.get('success');
  const redirect = searchParams.get('redirect') || '';

  // Show success/error messages if present in URL
  useState(() => {
    if (error) {
      toast({
        title: 'Authentication Error',
        description: decodeURIComponent(error),
        variant: 'destructive',
      });
    }

    if (success) {
      const successMessages = {
        'account_created': 'Account created successfully! Please log in.',
        'password_reset': 'Password has been reset successfully.',
        'logged_out': 'You have been logged out successfully.',
      };
      
      toast({
        title: 'Success',
        description: successMessages[success as keyof typeof successMessages] || 'Operation completed successfully.',
        variant: 'default',
      });
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      const { error } = await signInWithEmailAndPassword(
        formData.email,
        formData.password
      );
      
      if (error) {
        toast({
          title: 'Login Failed',
          description: error.message,
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }
      
      // If login is successful, redirect
      // The actual redirect will happen in the auth callback handler
      // This is just a fallback in case the redirect doesn't happen automatically
      if (redirect) {
        router.push(redirect);
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error('Unexpected login error:', error);
      toast({
        title: 'Unexpected Error',
        description: 'An unexpected error occurred. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Login</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Enter your credentials to access your account
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Your email address"
            required
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/reset-password"
              className="text-sm text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Your password"
            required
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>
      
      <div className="text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}