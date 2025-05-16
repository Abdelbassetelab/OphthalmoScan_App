'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';

// Navigation items for help section
const helpNavItems = [
  { path: '/help', label: 'Help Center' },
  { path: '/help/documentation', label: 'Documentation' },
  { path: '/help/faq', label: 'FAQ' },
  { path: '/help/contact', label: 'Contact Support' },
];

interface BreadcrumbProps {
  items: { label: string; path: string }[];
}

function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => (
          <li key={item.path} className="flex items-center">
            {index > 0 && <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />}
            <Link
              href={item.path}
              className={`text-sm ${
                index === items.length - 1
                  ? 'text-gray-700 font-medium'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Generate breadcrumb items based on current path
  const getBreadcrumbItems = () => {
    const items = [{ label: 'Help Center', path: '/help' }];
    const currentItem = helpNavItems.find(item => item.path === pathname);
    if (currentItem && pathname !== '/help') {
      items.push(currentItem);
    }
    return items;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <nav className="flex items-center space-x-6 h-16">
            {helpNavItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === item.path
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-600'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb items={getBreadcrumbItems()} />
        <main className="mt-6">
          <Card className="p-6">
            {children}
          </Card>
        </main>
      </div>
    </div>
  );
}
