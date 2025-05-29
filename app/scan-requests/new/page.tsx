'use client';

import React, { useState } from 'react';
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
import { UploadCloud, X, FileImage } from 'lucide-react';

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
    .enum(['low', 'medium', 'high']),
  has_image: z.boolean()
});

type NewScanRequestForm = z.infer<typeof newScanRequestSchema>;

export default function NewScanRequestPage() {  
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { supabase, isLoaded: isSupabaseLoaded } = useSupabaseWithClerk();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState("patient-info");
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const form = useForm<NewScanRequestForm>({
    resolver: zodResolver(newScanRequestSchema) as any,
    defaultValues: {
      reason: '',
      symptoms: '',
      urgency: 'medium',
      has_image: false
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Update form has_image value
      form.setValue('has_image', true);
      
      // Create image preview
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setImagePreview(null);
    form.setValue('has_image', false);
  };

  const uploadImageToStorage = async (file: File): Promise<string | null> => {
    if (!supabase || !user) {
      toast({
        title: 'Error',
        description: 'Authentication required for image upload',
        variant: 'destructive',
      });
      return null;
    }
    
    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      // File size validation (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'File Too Large',
          description: 'Please select an image under 10MB',
          variant: 'destructive',
        });
        return null;
      }
      
      // Generate a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `scan-request-${Date.now()}.${fileExt}`;
      const filePath = `scan-requests/new/${fileName}`;
      
      // Start progress simulation
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 300);
      
      // Upload the file to the existing 'images' bucket
      const { data, error } = await supabase.storage
        .from('images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      // Clear interval and set to 100% when complete
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (error) {
        console.error('Error uploading image:', error);
        throw new Error(error.message);
      }
      
      // Get the public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(data.path);
      
      toast({
        title: 'Upload Complete',
        description: 'Image uploaded successfully',
      });
      
      return publicUrl;
    } catch (error) {
      console.error('Image upload error:', error);
      toast({
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'Failed to upload the image',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };
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
        setIsSubmitting(false);
        return;
      }
      
      if (!data.symptoms || data.symptoms.length < 10) {
        toast({
          title: 'Validation Error',
          description: 'Symptoms must be at least 10 characters long',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }
      
      // Show loading toast
      toast({
        title: 'Submitting Request',
        description: 'Please wait while we process your request...',
      });

      // Upload image if file is selected
      let imageUrl = null;
      if (file && data.has_image) {
        imageUrl = await uploadImageToStorage(file);
        if (!imageUrl && data.has_image) {
          toast({
            title: 'Warning',
            description: 'Failed to upload image. Proceeding with request without image.',
            variant: 'destructive',
          });
        }
      }      // Get the username from Clerk user object
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
            has_image: !!imageUrl, // Set based on whether we have an image URL
            image_url: imageUrl, // Use the uploaded image URL
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
      case "patient-info": return 50;
      case "symptoms-assessment": return 100;
      default: return 50;
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
          <CardTitle>Scan Request Form</CardTitle>          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Section {activeSection === "patient-info" ? "1" : "2"} of 2</span>
              <span>{getProgressValue()}% Complete</span>
            </div>
            <Progress value={getProgressValue()} className="h-2" />
          </div>
        </CardHeader>
        <CardContent>          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">
              <Tabs 
                defaultValue="patient-info" 
                value={activeSection} 
                onValueChange={setActiveSection}
                className="space-y-4"
              >                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="patient-info" className="text-xs sm:text-sm">Patient Information</TabsTrigger>
                  <TabsTrigger value="symptoms-assessment" className="text-xs sm:text-sm">Symptoms & Assessment</TabsTrigger>
                </TabsList>

                {/* Section 1: Patient Information */}
                <TabsContent value="patient-info" className="space-y-6 border rounded-md p-4 bg-gray-50">
                  <h3 className="text-md font-medium text-gray-800 border-b pb-2">Patient Information</h3>
                    <FormField
                    control={form.control as any}
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
                    control={form.control as any}
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
                  />                  <FormField
                    control={form.control as any}
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
                  
                  {/* Image Upload Component */}
                  <div className="space-y-4">
                    <FormLabel>Upload Retinal Scan Image (Optional)</FormLabel>
                    
                    {!imagePreview ? (
                      <div className="border-2 border-dashed border-blue-200 bg-blue-50 rounded-lg p-8">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                          id="file-upload"
                          disabled={isSubmitting}
                        />
                        <label
                          htmlFor="file-upload"
                          className="flex flex-col items-center justify-center cursor-pointer"
                        >
                          <div className="bg-white rounded-full p-4 mb-4 shadow-sm">
                            <UploadCloud className="h-10 w-10 text-blue-500" />
                          </div>
                          <span className="text-blue-700 font-medium mb-1">Upload Retinal Scan Image</span>
                          <span className="text-sm text-blue-600 mb-3">Click to browse or drag and drop</span>
                          <span className="text-xs text-gray-500">Supported formats: JPG, PNG, JPEG (Max 10MB)</span>
                        </label>
                      </div>
                    ) : (
                      <div className="relative border rounded-lg overflow-hidden">
                        <div className="absolute top-2 right-2 z-10">
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="h-8 w-8 p-0 rounded-full"
                            onClick={handleRemoveFile}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="bg-gray-800 px-3 py-2 text-white text-sm font-medium flex items-center">
                          <FileImage className="h-4 w-4 mr-2" />
                          {file?.name || 'Selected Image'}
                        </div>
                        <div className="aspect-video bg-black flex items-center justify-center">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>                        <div className="px-3 py-2 text-xs text-gray-500">
                          Size: {file ? Math.round(file.size / 1024) : 0} KB
                          {isUploading && (
                            <div className="mt-2">
                              <div className="bg-gray-200 h-1 w-full rounded-full overflow-hidden">
                                <div 
                                  className="bg-blue-600 h-1 transition-all duration-300 ease-in-out" 
                                  style={{ width: `${uploadProgress}%` }}
                                ></div>
                              </div>
                              <p className="text-xs text-blue-600 mt-1">Uploading: {uploadProgress}%</p>
                            </div>
                          )}
                        </div>                      </div>
                    )}
                  </div>                  <div className="flex justify-between">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setActiveSection("patient-info")}
                    >
                      Previous: Patient Information
                    </Button>
                    <div className="flex space-x-4">                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSubmitting || isUploading}>
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
