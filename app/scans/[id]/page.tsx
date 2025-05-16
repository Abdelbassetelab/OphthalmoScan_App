'use client';

import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import ScanDetail from '@/components/scans/ScanDetail';
import { Skeleton } from '@/components/ui/skeleton';

export default function ScanDetailPage() {
  const { id } = useParams();

  return (
    <div className="container mx-auto p-6">
      <Suspense fallback={<Skeleton className="h-[600px]" />}>
        <ScanDetail scanId={id as string} />
      </Suspense>
    </div>
  );
}
