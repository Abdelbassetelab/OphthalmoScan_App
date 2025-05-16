'use client';

import { Suspense } from 'react';
import { useAuthContext } from '@/context/auth-context';
import ScanUploadForm from '@/components/scans/ScanUploadForm';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { RoleRestricted } from '@/components/ui/role-restricted';

export default function UploadScanPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Upload New Scan</h1>
      
      <RoleRestricted allowedRoles={['admin', 'doctor']} fallback={
        <Card className="p-6">
          <p className="text-red-500">You do not have permission to upload scans.</p>
        </Card>
      }>
        <Suspense fallback={<Skeleton className="h-[400px]" />}>
          <ScanUploadForm />
        </Suspense>
      </RoleRestricted>
    </div>
  );
}
