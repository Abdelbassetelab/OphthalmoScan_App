'use client';

import { Card } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function HelpPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Help Center</h1>
      <p className="text-gray-600">Welcome to the OphthalmoScan-AI Help Center. How can we assist you today?</p>

      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <Link href="/help/documentation">
          <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold mb-2">Documentation</h2>
                <p className="text-gray-600">User guides and detailed documentation</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </div>
          </Card>
        </Link>

        <Link href="/help/faq">
          <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold mb-2">FAQ</h2>
                <p className="text-gray-600">Frequently asked questions and answers</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </div>
          </Card>
        </Link>

        <Link href="/help/contact">
          <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold mb-2">Contact Support</h2>
                <p className="text-gray-600">Get in touch with our support team</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </div>
          </Card>
        </Link>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-2">Quick Help</h2>
          <ul className="space-y-2">
            <li className="text-primary hover:underline cursor-pointer">How to upload a scan</li>
            <li className="text-primary hover:underline cursor-pointer">Understanding scan results</li>
            <li className="text-primary hover:underline cursor-pointer">Account management</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
