'use client';

import React from 'react';
import { UserRole } from '@/lib/auth/clerk-auth';
import { Label } from '@/components/ui/label';

interface RoleSelectorProps {
  value: UserRole;
  onChange: (value: UserRole) => void;
  disabled?: boolean;
  label?: string;
  description?: string;
  roles?: Array<{
    value: UserRole;
    label: string;
    description?: string;
  }>;
}

export default function RoleSelector({
  value,
  onChange,
  disabled = false,
  label = "Role",
  description = "Select your role in the system",
  roles = [
    { value: "patient", label: "Patient", description: "Access your medical records and scans" },
    { value: "doctor", label: "Doctor", description: "Manage patients and diagnoses" },
    { value: "admin", label: "Administrator", description: "Full system administration access" }
  ]
}: RoleSelectorProps) {
  return (
    <div className="space-y-2">
      {label && <Label htmlFor="role-select">{label}</Label>}
      {description && <p className="text-sm text-gray-500">{description}</p>}
      
      <select
        id="role-select"
        value={value}
        onChange={(e) => onChange(e.target.value as UserRole)}
        disabled={disabled}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {roles.map((role) => (
          <option key={role.value} value={role.value}>
            {role.label}
          </option>
        ))}
      </select>
    </div>
  );
}