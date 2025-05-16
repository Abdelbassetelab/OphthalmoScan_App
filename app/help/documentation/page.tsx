'use client';

import DocumentationTabs from '@/components/help/DocumentationTabs';

export default function DocumentationPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Documentation</h1>
      <p className="text-gray-600">
        Comprehensive guides and documentation for using OphthalmoScan-AI.
      </p>
      
      <DocumentationTabs />
    </div>
  );
}
