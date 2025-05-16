'use client';

import ContactInfo from '@/components/help/ContactInfo';

export default function ContactPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Contact Support</h1>
      <p className="text-gray-600">
        Need help? Our support team is here to assist you.
      </p>
      
      <ContactInfo />
    </div>
  );
}
