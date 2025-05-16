'use client';

import React, { useState } from 'react';
import { useSignUp } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import RoleSelector from '@/components/ui/role-selector';
import { UserRole } from '@/lib/auth/clerk-auth';

export default function CustomSignUpForm() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<UserRole>('patient');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Step 1: Register user with email and password
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    try {
      setLoading(true);
      setError('');
      
      // Start the sign-up process
      await signUp.create({
        firstName,
        lastName,
        emailAddress: email,
        password,
      });

      // Send email verification code
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      
      // Set pending verification to true to show the verification form
      setPendingVerification(true);
    } catch (err: any) {
      console.error('Error during sign up:', err);
      setError(err.message || 'An error occurred during sign up');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify email with code
  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !code) return;

    try {
      setLoading(true);
      setError('');
      
      // Verify the email with the code
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      // If successful, set the user as active in the session
      if (completeSignUp.status === 'complete') {
        // After verification is complete, use the setActive method
        await setActive({ session: completeSignUp.createdSessionId });
        
        // After user is active, then update user metadata with role
        if (completeSignUp.createdUserId) {
          // Store role in user metadata via your backend API
          try {
            await fetch('/api/users/set-role', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ 
                userId: completeSignUp.createdUserId,
                role 
              }),
            });
          } catch (metadataErr) {
            console.error('Error setting user role:', metadataErr);
          }
        }
        
        // Redirect to the dashboard
        router.push('/dashboard');
      }
    } catch (err: any) {
      console.error('Error during verification:', err);
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show the email verification form if the user has submitted the sign-up form
  if (pendingVerification) {
    return (
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6">Verify Your Email</h2>
        <p className="mb-4">We&apos;ve sent a verification code to {email}. Please enter it below.</p>
        
        {error && <div className="mb-4 p-2 bg-red-100 text-red-600 rounded">{error}</div>}
        
        <form onSubmit={handleVerification} className="space-y-4">
          <div>
            <Label htmlFor="code">Verification Code</Label>
            <Input
              id="code"
              name="code"
              type="text"
              value={code}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCode(e.target.value)}
              required
            />
          </div>
          
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </Button>
        </form>
      </div>
    );
  }

  // Show the sign-up form
  return (
    <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Sign Up</h2>
      
      {error && <div className="mb-4 p-2 bg-red-100 text-red-600 rounded">{error}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              name="firstName"
              value={firstName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFirstName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              name="lastName"
              value={lastName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLastName(e.target.value)}
              required
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <RoleSelector
          value={role}
          onChange={setRole}
        />
        
        <Button
          type="submit"
          className="w-full"
          disabled={loading}
        >
          {loading ? 'Signing up...' : 'Sign Up'}
        </Button>
      </form>
    </div>
  );
}