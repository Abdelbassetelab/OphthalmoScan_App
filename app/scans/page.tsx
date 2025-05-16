'use client';

import { Suspense } from 'react';
import { useAuthContext } from '@/context/auth-context';
import ScanList from '@/components/scans/ScanList';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function ScansPage() {
  const { userRole, isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-[200px]" />
        <Card className="p-6">
          <Skeleton className="h-[400px]" />
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Scan Management</h1>
      <Suspense fallback={<Skeleton className="h-[400px]" />}>
        <ScanList userRole={userRole} />
      </Suspense>
    </div>
  );
}
