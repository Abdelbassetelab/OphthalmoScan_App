'use client';

import FaqAccordion from '@/components/help/FaqAccordion';

export default function FaqPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Frequently Asked Questions</h1>
      <p className="text-gray-600">
        Find answers to common questions about OphthalmoScan-AI.
      </p>
      
      <FaqAccordion />
    </div>
  );
}
