'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { useSupabaseWithClerk } from '@/lib/auth/supabase-clerk';

// Form validation schema
const newScanRequestSchema = z.object({
  reason: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must not exceed 500 characters'),
  symptoms: z
    .string()
    .min(10, 'Symptoms must be at least 10 characters')
    .max(500, 'Symptoms must not exceed 500 characters'),
  urgency: z
    .enum(['low', 'medium', 'high'])
    .default('medium'),
  has_image: z.boolean().default(false),
  image_url: z.string().optional(),
  doctor_notes: z.string().optional(),
  diagnosis: z.string().optional(),
  confidence: z.number().optional(),
  recommendations: z.string().optional()
});

type NewScanRequestForm = z.infer<typeof newScanRequestSchema>;

export default function NewScanRequestPage() {  
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { supabase, isLoaded: isSupabaseLoaded } = useSupabaseWithClerk();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState("patient-info");
  
  const form = useForm<NewScanRequestForm>({
    resolver: zodResolver(newScanRequestSchema),
    defaultValues: {
      reason: '',
      symptoms: '',
      urgency: 'medium',
      has_image: false,
      image_url: '',
      doctor_notes: '',
      diagnosis: '',
      confidence: 0,
      recommendations: ''
    },
  });  

  async function onSubmit(data: NewScanRequestForm) {
    if (!supabase || !user) {
      toast({
        title: 'Error',
        description: 'Authentication required',
        variant: 'destructive',
      });
      return;
    }

    try {
      console.log('Submitting form data:', data);
      
      // Disable form submission during processing
      setIsSubmitting(true);
      
      // Check if there are required parameters missing
      if (!data.reason || data.reason.length < 10) {
        toast({
          title: 'Validation Error',
          description: 'Description must be at least 10 characters long',
          variant: 'destructive',
        });
        return;
      }
      
      if (!data.symptoms || data.symptoms.length < 10) {
        toast({
          title: 'Validation Error',
          description: 'Symptoms must be at least 10 characters long',
          variant: 'destructive',
        });
        return;
      }
      
      // Show loading toast
      toast({
        title: 'Submitting Request',
        description: 'Please wait while we process your request...',
      });
        // Get the username from Clerk user object
      const patientUsername = user.username || 
        (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : 'Unknown User');
      
      console.log('Using patient_username:', patientUsername);
      
      const { data: scanRequest, error } = await supabase
        .from('scan_requests')
        .insert([
          {
            patient_id: user.id,
            user_id: user.id,  // Add user_id field with the same value as patient_id
            description: data.reason,
            symptoms: data.symptoms,
            priority: data.urgency,
            has_image: data.has_image,
            image_url: data.image_url || null,
            status: 'pending',
            patient_username: patientUsername, // Add the patient_username field
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating scan request:', error);
        throw error;
      }

      console.log('Scan request created:', scanRequest);

      toast({
        title: 'Success',
        description: 'Your scan request has been submitted successfully.',
      });

      router.push('/scan-requests/my-requests');
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to submit scan request. Please try again.',
        variant: 'destructive',
      });
    }
  }

  // Get the progress percentage based on active section
  const getProgressValue = () => {
    switch (activeSection) {
      case "patient-info": return 33;
      case "symptoms-assessment": return 66;
      case "diagnostic-info": return 100;
      default: return 33;
    }
  };

  if (!isLoaded || !isSupabaseLoaded) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-blue-600 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Request New Eye Scan</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Scan Request Form</CardTitle>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Section {activeSection === "patient-info" ? "1" : activeSection === "symptoms-assessment" ? "2" : "3"} of 3</span>
              <span>{getProgressValue()}% Complete</span>
            </div>
            <Progress value={getProgressValue()} className="h-2" />
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs 
                defaultValue="patient-info" 
                value={activeSection} 
                onValueChange={setActiveSection}
                className="space-y-4"
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="patient-info" className="text-xs sm:text-sm">Patient Information</TabsTrigger>
                  <TabsTrigger value="symptoms-assessment" className="text-xs sm:text-sm">Symptoms & Assessment</TabsTrigger>
                  <TabsTrigger value="diagnostic-info" className="text-xs sm:text-sm">Diagnostic Information</TabsTrigger>
                </TabsList>

                {/* Section 1: Patient Information */}
                <TabsContent value="patient-info" className="space-y-6 border rounded-md p-4 bg-gray-50">
                  <h3 className="text-md font-medium text-gray-800 border-b pb-2">Patient Information</h3>
                  
                  <FormField
                    control={form.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Please describe why you need an eye scan..."
                            className="min-h-[100px] bg-white"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end">
                    <Button 
                      type="button" 
                      onClick={() => setActiveSection("symptoms-assessment")}
                    >
                      Next: Symptoms & Assessment
                    </Button>
                  </div>
                </TabsContent>

                {/* Section 2: Symptoms & Assessment */}
                <TabsContent value="symptoms-assessment" className="space-y-6 border rounded-md p-4 bg-gray-50">
                  <h3 className="text-md font-medium text-gray-800 border-b pb-2">Symptoms & Assessment</h3>
                  
                  <FormField
                    control={form.control}
                    name="symptoms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Symptoms</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Please describe any symptoms you are experiencing..."
                            className="min-h-[100px] bg-white"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="urgency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Urgency Level</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <SelectTrigger className="bg-white">
                              <SelectValue placeholder="Select urgency level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="has_image"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center gap-2 space-y-0">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                        </FormControl>
                        <FormLabel className="m-0">Has Image</FormLabel>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="image_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image URL</FormLabel>
                        <FormControl>
                          <input
                            type="url"
                            placeholder="Enter image URL"
                            className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-between">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setActiveSection("patient-info")}
                    >
                      Previous: Patient Information
                    </Button>
                    <Button 
                      type="button" 
                      onClick={() => setActiveSection("diagnostic-info")}
                    >
                      Next: Diagnostic Information
                    </Button>
                  </div>
                </TabsContent>

                {/* Section 3: Diagnostic Information */}
                <TabsContent value="diagnostic-info" className="space-y-6 border rounded-md p-4 bg-gray-50">
                  <h3 className="text-md font-medium text-gray-800 border-b pb-2">Diagnostic Information</h3>
                  
                  <FormField
                    control={form.control}
                    name="doctor_notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Doctor Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Doctor notes will be added after review"
                            className="min-h-[100px] bg-white"
                            disabled={true}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="diagnosis"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Diagnosis</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Diagnosis will be added after review"
                            className="min-h-[100px] bg-white"
                            disabled={true}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confidence"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confidence Level</FormLabel>
                        <FormControl>
                          <input
                            type="number"
                            min="0"
                            max="1"
                            step="0.01"
                            placeholder="Confidence level (0-1)"
                            disabled={true}
                            className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="recommendations"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recommendations</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Recommendations will be added after review"
                            className="min-h-[100px] bg-white"
                            disabled={true}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-between">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setActiveSection("symptoms-assessment")}
                    >
                      Previous: Symptoms & Assessment
                    </Button>
                    <div className="flex space-x-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Submitting...' : 'Submit Request'}
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
