'use client';

import React from 'react';
import { Eye } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center justify-center mb-8">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white mb-4">
          <Eye className="h-6 w-6" />
        </div>
        <h1 className="text-3xl font-bold text-blue-700">OphthalmoScan AI</h1>
        <p className="mt-2 text-gray-600">Advanced Eye Diagnostic Platform</p>
      </div>
      
      <div className="max-w-md w-full bg-white shadow-md rounded-xl p-8">
        {children}
      </div>
    </div>
  );
}