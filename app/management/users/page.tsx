'use client';

import { useEffect, useState } from 'react';
import { useSession, useUser } from '@clerk/nextjs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import AddUserForm from './add-user-form';
import { useSupabaseWithClerk } from '@/lib/auth/supabase-clerk';

type User = {
  id: string;
  email: string;
  role: string;
  created_at: string;
  last_sign_in: string;
};

export default function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
    // Get Clerk user
  const { user } = useUser();
  
  // Get Supabase client with Clerk auth
  const { supabase, isLoaded } = useSupabaseWithClerk();
  
  useEffect(() => {
    async function fetchUsers() {
      if (!isLoaded || !supabase || !user) return;
      
      try {
        console.log("Fetching users from Supabase with authenticated client...");
        
        const { data, error } = await supabase
          .from('users')
          .select('id, email, role, created_at, last_sign_in')
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }
        
        console.log("Fetched users:", data);
        setUsers(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred fetching users');
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();  }, [user, refreshTrigger, supabase, isLoaded]);
  
  async function updateUserRole(userId: string, newRole: string) {
    if (!supabase) {
      setError('Supabase client not initialized');
      return;
    }
    
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating user role');
    }
  }  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Card className="p-6 bg-red-50 border-red-200">
          <h2 className="text-lg font-semibold text-red-700">Error</h2>
          <p className="text-red-600">{error}</p>
        </Card>
      </div>
    );
  }  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">User Management</h1>
        <Button 
          onClick={() => setRefreshTrigger(prev => prev + 1)}
          variant="outline"
        >
          Refresh Users
        </Button>
      </div>

      <AddUserForm />

      <Card className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Last Sign In</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length > 0 ? (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <select
                      value={user.role}
                      onChange={(e) => updateUserRole(user.id, e.target.value)}
                      className="border rounded px-2 py-1"
                    >
                      <option value="admin">Admin</option>
                      <option value="doctor">Doctor</option>
                      <option value="patient">Patient</option>
                    </select>
                  </TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {user.last_sign_in ? new Date(user.last_sign_in).toLocaleDateString() : 'Never'}
                  </TableCell>
                  <TableCell>
                    {/* Add more actions here if needed */}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6">
                  <p className="text-gray-500">No users found in the database.</p>
                  <p className="text-sm text-gray-400 mt-2">You need to add users to your Supabase database.</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}