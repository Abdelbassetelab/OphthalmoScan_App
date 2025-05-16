'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { signUpWithEmailAndPassword } from '@/lib/auth/supabase-auth';

// Password strength indicator component
const PasswordStrengthIndicator = ({ password }: { password: string }) => {
  if (!password) return null;
  
  // Calculate strength score (0-4)
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  
  // Map score to label and color
  // Ensure score is within bounds (0-4)
  score = Math.max(0, Math.min(4, score));
  
  const strength = [
    { label: 'Very Weak', color: 'bg-red-500', width: '20%' },
    { label: 'Weak', color: 'bg-orange-500', width: '40%' },
    { label: 'Medium', color: 'bg-yellow-500', width: '60%' },
    { label: 'Strong', color: 'bg-lime-500', width: '80%' },
    { label: 'Very Strong', color: 'bg-green-500', width: '100%' }
  ][score];
  
  return (
    <div className="mt-2">
      <div className="flex justify-between text-xs mb-1">
        <span>Password Strength</span>
        <span>{strength?.label || 'None'}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`${strength?.color || 'bg-gray-300'} h-2 rounded-full transition-all duration-300`} 
          style={{ width: strength?.width || '0%' }}
        ></div>
      </div>
    </div>
  );
};

// Define form validation schema with enhanced password requirements
const registerSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email is required' })
    .email({ message: 'Invalid email address' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' }),
  confirmPassword: z.string().min(1, { message: 'Please confirm your password' }),
  firstName: z.string().min(1, { message: 'First name is required' }),
  lastName: z.string().min(1, { message: 'Last name is required' }),
  role: z.enum(['patient', 'doctor', 'admin'], {
    required_error: 'Please select a role',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Check for success or error messages in URL when component mounts
  useEffect(() => {
    const error = searchParams?.get('error');
    const success = searchParams?.get('success');
    
    if (error) {
      setErrorMessage(decodeURIComponent(error));
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: decodeURIComponent(error),
      });
    }
    
    if (success) {
      setSuccessMessage(
        success === 'account_created' 
          ? 'Account created successfully! Check your email to verify your account.' 
          : 'Success!'
      );
      toast({
        title: 'Success',
        description: success === 'account_created' 
          ? 'Account created successfully! Check your email to verify your account.' 
          : 'Success!',
      });
    }
  }, [searchParams, toast]);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      role: 'patient',
    },
  });

  async function onSubmit(data: RegisterFormValues) {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    
    try {
      console.log("Submitting registration form with data:", {
        ...data,
        password: "[REDACTED]",
        confirmPassword: "[REDACTED]"
      });
      
      // Method 1: Use the client-side Supabase auth helper (preferred for simpler signup flows)
      const { error, data: userData } = await signUpWithEmailAndPassword(
        data.email,
        data.password,
        {
          first_name: data.firstName,
          last_name: data.lastName,
          role: data.role,
        }
      );
      
      if (error) {
        setErrorMessage(error.message);
        toast({
          variant: 'destructive',
          title: 'Registration Failed',
          description: error.message,
        });
        return;
      }
      
      if (userData?.user?.identities?.length === 0) {
        setErrorMessage('An account with this email already exists.');
        toast({
          variant: 'destructive',
          title: 'Registration Failed',
          description: 'An account with this email already exists.',
        });
        return;
      }
      
      // Method 2: Use the API route (used in cases where you need more server-side logic)
      // Keeping this code commented as reference, but we'll use Method 1 by default
      /*
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role,
        }),
      });

      const result = await response.json();
      
      console.log("Registration API response:", {
        status: response.status,
        ok: response.ok,
        result
      });

      if (!response.ok) {
        setErrorMessage(result.error || 'Registration failed. Please try again.');
        toast({
          variant: 'destructive',
          title: 'Registration Failed',
          description: result.error || 'An error occurred during registration.',
        });
        return;
      }
      */

      setSuccessMessage('Registration successful! Please check your email to verify your account.');
      toast({
        title: 'Registration Successful',
        description: 'Please check your email for verification instructions.',
      });
      
      // Redirect to login page with success parameter
      router.push('/login?success=account_created');
    } catch (error) {
      console.error('Registration error:', error);
      setErrorMessage('An unexpected error occurred. Please try again.');
      toast({
        variant: 'destructive',
        title: 'Registration Error',
        description: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md space-y-8 p-4 sm:p-6 md:p-8 bg-white rounded-lg shadow-md">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">Create an account</h1>
        <p className="text-sm text-gray-600 mt-2">
          Enter your information to create an account
        </p>
      </div>
      
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{successMessage}</span>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input 
                    type="email" 
                    placeholder="name@example.com" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="patient">Patient</SelectItem>
                    <SelectItem value="doctor">Doctor</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input 
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••" 
                      {...field} 
                    />
                  </FormControl>
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
                <PasswordStrengthIndicator password={field.value} />
                <ul className="mt-1 text-xs text-gray-500 list-disc pl-5">
                  <li className={field.value.length >= 8 ? 'text-green-600' : ''}>
                    At least 8 characters
                  </li>
                  <li className={/[A-Z]/.test(field.value) ? 'text-green-600' : ''}>
                    At least one uppercase letter
                  </li>
                  <li className={/[a-z]/.test(field.value) ? 'text-green-600' : ''}>
                    At least one lowercase letter
                  </li>
                  <li className={/[0-9]/.test(field.value) ? 'text-green-600' : ''}>
                    At least one number
                  </li>
                </ul>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input 
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••" 
                      {...field} 
                    />
                  </FormControl>
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>
      </Form>

      <div className="text-center text-sm mt-4">
        <p>
          Already have an account?{' '}
          <Link 
            href="/login" 
            className="font-semibold text-primary hover:text-primary/80"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}