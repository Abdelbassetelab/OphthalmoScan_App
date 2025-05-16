'use client';

import { Card } from '@/components/ui/card';
import { Mail, Clock, Phone } from 'lucide-react';
import { useAuthContext } from '@/context/auth-context';

const supportContacts = {
  admin: {
    email: 'admin-support@ophthalmoscan.ai',
    phone: '+1 (555) 123-4567',
    hours: '24/7 Priority Support'
  },
  doctor: {
    email: 'medical-support@ophthalmoscan.ai',
    phone: '+1 (555) 234-5678',
    hours: 'Mon-Fri, 8 AM - 8 PM EST'
  },
  patient: {
    email: 'patient-support@ophthalmoscan.ai',
    phone: '+1 (555) 345-6789',
    hours: 'Mon-Fri, 9 AM - 5 PM EST'
  }
};

export default function ContactInfo() {
  const { userRole } = useAuthContext();
  const contact = supportContacts[userRole as keyof typeof supportContacts] || supportContacts.patient;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Contact Support</h2>
      <p className="text-gray-600">
        Our support team is here to help you with any questions or issues you may have.
      </p>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-start space-x-4">
            <Mail className="h-6 w-6 text-primary mt-1" />
            <div>
              <h3 className="font-medium">Email Support</h3>
              <p className="text-sm text-gray-600 mt-1">Response within 24 hours</p>
              <a 
                href={`mailto:${contact.email}`}
                className="text-primary hover:underline mt-2 block"
              >
                {contact.email}
              </a>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start space-x-4">
            <Phone className="h-6 w-6 text-primary mt-1" />
            <div>
              <h3 className="font-medium">Phone Support</h3>
              <p className="text-sm text-gray-600 mt-1">Direct assistance</p>
              <a 
                href={`tel:${contact.phone}`}
                className="text-primary hover:underline mt-2 block"
              >
                {contact.phone}
              </a>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start space-x-4">
            <Clock className="h-6 w-6 text-primary mt-1" />
            <div>
              <h3 className="font-medium">Support Hours</h3>
              <p className="text-sm text-gray-600 mt-1">Available during</p>
              <p className="text-primary mt-2">{contact.hours}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6 mt-8">
        <h3 className="font-semibold mb-4">Expected Response Times</h3>
        <ul className="space-y-2 text-gray-600">
          <li>• Emergency issues: Within 1 hour</li>
          <li>• Technical issues: Within 4 hours</li>
          <li>• General inquiries: Within 24 hours</li>
          <li>• Feature requests: Within 48 hours</li>
        </ul>
      </Card>
    </div>
  );
}
