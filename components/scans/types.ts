import { UserRole } from '@/lib/auth/clerk-auth';

export interface Scan {
  id: string;
  patientId: string;
  doctorId: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'pending' | 'analyzed' | 'diagnosed';
  type: string;
  imageUrl: string;
  metadata: Record<string, any>;
}

export interface ScanListProps {
  userRole: UserRole;
}

export interface ScanCardProps {
  scan: Scan;
  userRole: UserRole;
  onView?: (scan: Scan) => void;
  onDelete?: (scan: Scan) => void;
  onReassign?: (scan: Scan) => void;
}

export interface ScanDetailProps {
  scanId: string;
}

export interface ScanViewerProps {
  imageUrl: string;
  alt?: string;
  controls?: boolean;
}

export interface ScanUploadFormProps {
  onUploadComplete?: (scan: Scan) => void;
  onUploadError?: (error: Error) => void;
}
