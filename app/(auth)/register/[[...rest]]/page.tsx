'use client';

import { SignUp } from '@clerk/nextjs';

export default function RegisterPage() {
  return (
    <div className="flex items-center justify-center min-h-screen py-12 bg-gray-50">
      <SignUp path="/register" routing="path" signInUrl="/login" afterSignUpUrl="/dashboard" />
    </div>
  );
}