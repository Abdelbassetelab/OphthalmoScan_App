import { 
  Home, 
  Users, 
  FileImage, 
  Activity, 
  Settings, 
  User, 
  Eye,
  BarChart,
  Clipboard,
  Calendar,
  BookOpen,
  Bell,
  HelpCircle,
  Shield,
  FileText,
  UserCog,
  Database,
  Stethoscope,
  HeartPulse,
  Clock,
  MessageSquare
} from 'lucide-react';

export type MenuItem = {
  path: string;
  label: string;
  icon: React.ElementType;
  roleAccess: string[];
  children?: MenuItem[];
  color?: string;
};

// Role-specific utility items
export const utilityItemsByRole: Record<string, MenuItem[]> = {
  admin: [
    { 
      path: '/settings/admin', 
      label: 'System Settings', 
      icon: Settings, 
      roleAccess: ['admin'],
      color: 'text-teal-600'
    },
    { 
      path: '/help', 
      label: 'Admin Support', 
      icon: HelpCircle, 
      roleAccess: ['admin'],
      color: 'text-teal-600'
    }
  ],
  doctor: [
    { 
      path: '/settings', 
      label: 'Practice Settings', 
      icon: Settings, 
      roleAccess: ['doctor'],
      color: 'text-teal-600'
    },
    { 
      path: '/help', 
      label: 'Medical Support', 
      icon: HelpCircle, 
      roleAccess: ['doctor'],
      color: 'text-teal-600'
    }
  ],
  patient: [
    
    { 
      path: '/settings', 
      label: 'Account Settings', 
      icon: Settings, 
      roleAccess: ['patient'],
      color: 'text-teal-600'
    },
    { 
      path: '/help', 
      label: 'Patient Support', 
      icon: HelpCircle, 
      roleAccess: ['patient'],
      color: 'text-teal-600'
    }
  ]
};

// Role-specific menu items
export const menuItemsByRole: Record<string, MenuItem[]> = {
  admin: [
    { 
      path: '/dashboard', 
      label: 'Admin Dashboard', 
      icon: Home, 
      roleAccess: ['admin'],
      color: 'text-teal-600'
    },
    { 
      path: '/management', 
      label: 'Management', 
      icon: Shield, 
      roleAccess: ['admin'],
      color: 'text-teal-600',
      children: [
        { path: '/management/users', label: 'User Management', icon: UserCog, roleAccess: ['admin'] },
        { path: '/model-test', label: 'Model Test', icon: Database, roleAccess: ['admin'] },
        { path: '/scan-analysis', label: 'Scan Analysis', icon: Eye, roleAccess: ['admin'] }
      ]
    },
    {
      path: '/analytics', 
      label: 'Analytics', 
      icon: BarChart, 
      roleAccess: ['admin'],
      color: 'text-teal-600',
      children: [
        { path: '/analytics/usage', label: 'System Usage', icon: Activity, roleAccess: ['admin'] },
        { path: '/analytics/scans', label: 'Scan Statistics', icon: FileImage, roleAccess: ['admin'] }
      ]
    }
  ],
  doctor: [
    { 
      path: '/dashboard', 
      label: 'Doctor Dashboard', 
      icon: Home, 
      roleAccess: ['doctor'],
      color: 'text-teal-600'
    },    { 
      path: '/scan-requests/new', 
      label: 'New Scan', 
      icon: Eye, 
      roleAccess: ['doctor'],
      color: 'text-teal-600'
    },
    { 
      path: '/patients', 
      label: 'Patient Management', 
      icon: Users, 
      roleAccess: ['doctor'],
      color: 'text-teal-600',
      children: [
        { path: '/patients/list', label: 'Patient List', icon: Clipboard, roleAccess: ['doctor'] },
        { path: '/patients/appointments', label: 'Appointments', icon: Calendar, roleAccess: ['doctor'] }
      ]
    },    { 
      path: '/scan-requests', 
      label: 'Scan Requests', 
      icon: Stethoscope, 
      roleAccess: ['doctor'],
      color: 'text-teal-600',
      children: [
        { path: '/scan-requests', label: 'All Requests', icon: Clipboard, roleAccess: ['doctor'] },
        { path: '/scan-requests/my-requests', label: 'Request Management', icon: Clock, roleAccess: ['doctor'] },
        { path: '/scan-requests/new', label: 'New Request', icon: Eye, roleAccess: ['doctor'] }
      ]
    }
  ],
  patient: [
    { 
      path: '/dashboard', 
      label: 'Patient Dashboard', 
      icon: Home, 
      roleAccess: ['patient'],
      color: 'text-teal-600'
    },
    { 
      path: '/my-health', 
      label: 'My Health', 
      icon: Activity, 
      roleAccess: ['patient'],
      color: 'text-teal-600',
      children: [
        { path: '/my-health/diagnoses', label: 'My Diagnoses', icon: FileText, roleAccess: ['patient'] },
        { path: '/my-health/appointments', label: 'My Appointments', icon: Calendar, roleAccess: ['patient'] },
        { path: '/model-test', label: 'Ask for Diagnostic', icon: Eye, roleAccess: ['patient'] }
      ]
    }
  ]
};

// Common menu items shared across all roles
export const commonMenuItems: MenuItem[] = [
  // { 
  //   path: '/messages', 
  //   label: 'Messages', 
  //   icon: MessageSquare, 
  //   roleAccess: ['admin', 'doctor', 'patient'] 
  // },
  // { 
  //   path: '/notifications', 
  //   label: 'Notifications', 
  //   icon: Bell, 
  //   roleAccess: ['admin', 'doctor', 'patient'] 
  // },
  { 
    path: '/profile', 
    label: 'Profile', 
    icon: User, 
    roleAccess: ['admin', 'doctor', 'patient'] 
  }
];
