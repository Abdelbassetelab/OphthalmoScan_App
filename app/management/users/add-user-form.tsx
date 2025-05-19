'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useUser } from '@clerk/nextjs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSupabaseWithClerk } from '@/lib/auth/supabase-clerk';

export default function AddUserForm() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('patient');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  
  // Get Clerk user
  const { user } = useUser();
  
  // Get Supabase client with Clerk auth
  const { supabase, isLoaded } = useSupabaseWithClerk();
  
  async function handleAddUser(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (!isLoaded || !supabase || !user) {
      setMessage({
        text: 'Authentication error: Not authenticated or Supabase client not initialized',
        type: 'error'
      });
      setLoading(false);
      return;
    }

    try {
      // Create a UUID for the user ID
      const userId = crypto.randomUUID();
      const now = new Date().toISOString();
      
      // Use the authenticated Supabase client
      const { error } = await supabase
        .from('users')
        .insert([
          { 
            id: userId, 
            email, 
            role, 
            created_at: now,
            last_sign_in: null 
          }
        ]);
      
      if (error) {
        throw new Error(error.message || 'Error adding user');
      }
      
      setMessage({
        text: `User ${email} added successfully!`,
        type: 'success'
      });
      
      // Reset form
      setEmail('');
      setRole('patient');
    } catch (err) {
      console.error('Error adding user:', err);
      setMessage({
        text: err instanceof Error ? err.message : 'Error adding user',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Add Test User</h2>
      <form onSubmit={handleAddUser} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="user@example.com"
          />
        </div>
        
        <div>
          <label htmlFor="role" className="block text-sm font-medium mb-1">
            Role
          </label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="doctor">Doctor</SelectItem>
              <SelectItem value="patient">Patient</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Adding...' : 'Add User'}
        </Button>
        
        {message && (
          <div className={`p-3 rounded ${
            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {message.text}
          </div>
        )}
      </form>
    </Card>
  );
}
