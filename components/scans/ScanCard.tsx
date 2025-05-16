'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { 
  Eye, 
  MoreVertical, 
  Download, 
  Trash, 
  UserPlus 
} from 'lucide-react';
import type { ScanCardProps } from './types';

export default function ScanCard({ 
  scan, 
  userRole, 
  onView, 
  onDelete, 
  onReassign 
}: ScanCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'analyzed':
        return 'bg-blue-100 text-blue-800';
      case 'diagnosed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="overflow-hidden">
      {/* Scan Preview */}
      <div className="aspect-video bg-gray-100 relative group">
        {scan.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={scan.imageUrl}
            alt={`Scan ${scan.id}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-gray-500">No preview</p>
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button variant="secondary" size="sm" onClick={() => onView?.(scan)}>
            <Eye className="h-4 w-4 mr-2" />
            View
          </Button>
        </div>
      </div>

      {/* Scan Info */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-medium">Scan #{scan.id.slice(0, 8)}</h3>
            <p className="text-sm text-gray-500">
              {new Date(scan.createdAt).toLocaleDateString()}
            </p>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(scan.status)}`}>
            {scan.status}
          </span>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mt-4">
          <Link href={`/scans/${scan.id}`}>
            <Button variant="outline" size="sm">
              View Details
            </Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <Download className="h-4 w-4 mr-2" />
                Download
              </DropdownMenuItem>
              {userRole === 'admin' && (
                <>
                  <DropdownMenuItem onClick={() => onReassign?.(scan)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Reassign
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDelete?.(scan)}
                    className="text-red-600"
                  >
                    <Trash className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  );
}
