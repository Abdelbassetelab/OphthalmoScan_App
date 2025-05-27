'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { 
  ArrowLeft, 
  FileImage, 
  UploadCloud, 
  X, 
  RefreshCw, 
  Download,
  User,
  Calendar,
  Stethoscope,
  FileText,
  Eye,
  AlertTriangle
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import useUserRole from '@/hooks/use-user-role';
import { isDoctor } from '@/lib/auth/role-helpers';
import { useSupabaseWithClerk } from '@/lib/auth/supabase-clerk';
import { predictEyeDisease } from '@/lib/ai/predict-disease';
import { Database } from '@/types/database.types';
// @ts-ignore - These packages might not have proper TypeScript definitions
import html2canvas from 'html2canvas';
// @ts-ignore
import jsPDF from 'jspdf';

// Types for scan request
type DbScanRequest = Database['public']['Tables']['scan_requests']['Row'];

interface ScanRequest extends DbScanRequest {
  patientName?: string;
  doctorName?: string;
  requestDate?: string;
  notes?: string;
  doctorId?: string;
  patientId?: string;
  images?: { id: string; url: string; uploadedAt: string }[];
  patient_username?: string;
  assigned_doctor_username?: string;
}

interface AnalysisResult {
  prediction: string;
  confidence: number;
  allPredictions: { label: string; probability: number }[];
}

export default function ScanRequestAnalysePage() {
  const { isSignedIn, isLoaded: isAuthLoaded } = useAuth();
  const { user, isLoaded: isUserLoaded } = useUser();
  const router = useRouter();
  const { role, isLoading: isRoleLoading } = useUserRole();
  const { supabase, isLoaded: isSupabaseLoaded } = useSupabaseWithClerk();
  const [isLoading, setIsLoading] = useState(true);
  const [scanRequest, setScanRequest] = useState<ScanRequest | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [doctorNotes, setDoctorNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [serviceStatus, setServiceStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const params = useParams();
  const id = params?.id as string;
  const { toast } = useToast();
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkModelStatus = async () => {
      try {
        const response = await fetch('/api/ai/status');
        if (response.ok) {
          const data = await response.json();
          setServiceStatus(data.status === 'online' ? 'online' : 'offline');
        } else {
          setServiceStatus('offline');
        }
      } catch (error) {
        console.error('Error checking model status:', error);
        setServiceStatus('offline');
      }
    };

    checkModelStatus();
  }, []);  const fetchScanRequest = async () => {
    try {
      if (!supabase) return;
      
      // Get scan request by ID
      const { data, error } = await supabase
        .from('scan_requests')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error fetching scan request:', error);
        setScanRequest(null);
      } else if (data) {
        // Convert the Supabase data to our ScanRequest format
        const scanRequestData: ScanRequest = {
          ...data,
          requestDate: data.created_at,
          notes: data.symptoms || data.medical_history || 'No additional notes available'
        };
        
        // Set doctor notes if they exist
        if (data.doctor_note) {
          setDoctorNotes(data.doctor_note);
        }
        
        // Set image URL if it exists
        if (data.image_url) {
          setImageUrl(data.image_url);
        }
        
        setScanRequest(scanRequestData);
      } else {
        setScanRequest(null);
      }
    } catch (error) {
      console.error('Error fetching scan request:', error);
      setScanRequest(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthLoaded || !isUserLoaded || isRoleLoading || !isSupabaseLoaded || !supabase) return;

    if (!isSignedIn) {
      router.replace('/sign-in');
      return;
    }

    // Only doctors should access this page
    if (!isDoctor(role)) {
      toast({
        title: 'Access Denied',
        description: 'Only doctors can analyze scan requests',
        variant: 'destructive',
      });
      router.replace('/scan-requests');
      return;
    }

    fetchScanRequest();
  }, [isAuthLoaded, isUserLoaded, isRoleLoading, isSignedIn, user, router, id, supabase, isSupabaseLoaded, role]);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // File size validation (10MB limit)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({
          title: 'File Too Large',
          description: 'Please select an image under 10MB',
          variant: 'destructive',
        });
        return;
      }
      
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
      setResult(null);
      // Reset image URL and result when new file is selected
      setImageUrl(null);
    }
  };
  const handleAnalyzeImage = async () => {
    if (!file) {
      toast({
        title: 'No Image Selected',
        description: 'Please select an image to analyze',
        variant: 'destructive',
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: 'Authentication Error',
        description: 'You must be logged in to analyze images',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsAnalyzing(true);
      setResult(null);
      
      // First upload the image to storage
      if (!imageUrl) {
        const uploadedImageUrl = await uploadImageToStorage(file);
        
        if (!uploadedImageUrl) {
          throw new Error('Failed to upload image to storage');
        }
      }
      
      // Analyze the image with user ID
      const predictionResult = await predictEyeDisease(file, user.id);
      
      if (!predictionResult) {
        throw new Error('Failed to analyze the image');
      }
      
      const predictions = Object.entries(predictionResult.predictions).map(([label, probability]) => ({
        label,
        probability: probability * 100
      }));
      
      const sortedPredictions = [...predictions].sort((a, b) => b.probability - a.probability);
      
      setResult({
        prediction: predictionResult.top_prediction,
        confidence: sortedPredictions[0].probability,
        allPredictions: sortedPredictions,
      });
      
      toast({
        title: 'Analysis Complete',
        description: `Primary diagnosis: ${formatCondition(predictionResult.top_prediction)}`,
        variant: 'default',
      });
    } catch (error) {
      console.error('Error analyzing image:', error);
      toast({
        title: 'Analysis Failed',
        description: error instanceof Error ? error.message : 'Failed to analyze the image',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };
  const clearImage = () => {
    setFile(null);
    setImagePreview(null);
    setImageUrl(null);
    setResult(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCondition = (condition: string): string => {
    return condition
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;

    try {
      toast({
        title: 'Generating PDF',
        description: 'Please wait while we generate your report',
      });

      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // Use patient_username in the filename if available
      const patientName = scanRequest.patient_username 
        ? scanRequest.patient_username.replace(/\s+/g, '-') 
        : `patient-${scanRequest.patient_id?.substring(0, 8)}`;
      pdf.save(`eye-scan-analysis-${patientName}-${id}.pdf`);

      toast({
        title: 'PDF Generated',
        description: 'Your report has been downloaded',
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate PDF report',
        variant: 'destructive',
      });
    }
  };

  const handleSaveNotes = async () => {
    if (!supabase || !scanRequest) return;
    
    try {
      setIsSavingNotes(true);
      
      // Update the doctor notes in the database
      const { error } = await supabase
        .from('scan_requests')
        .update({
          doctor_note: doctorNotes,
          // Update status to 'reviewed' if adding notes
          status: doctorNotes.trim() ? 'reviewed' : scanRequest.status
        })
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: 'Notes Saved',
        description: 'Your clinical notes have been saved successfully',
      });
      
    } catch (error) {
      console.error('Error saving doctor notes:', error);
      toast({
        title: 'Error',
        description: 'Failed to save your notes. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSavingNotes(false);
    }
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
      const fileName = `${id}_${Date.now()}.${fileExt}`;
      const filePath = `scan-requests/${id}/${fileName}`;
      
      // Upload the file to the existing 'images' bucket
      const { data, error } = await supabase.storage
        .from('images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          onUploadProgress: (progress) => {
            const percentage = (progress.loaded / progress.total) * 100;
            setUploadProgress(Math.round(percentage));
          },
        });
      
      if (error) {
        console.error('Error uploading image:', error);
        throw new Error(error.message);
      }
      
      // Get the public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(data.path);
      
      // Update the scan request with the image URL
      const { error: updateError } = await supabase
        .from('scan_requests')
        .update({ 
          has_image: true,
          image_url: publicUrl 
        })
        .eq('id', id);
      
      if (updateError) {
        console.error('Error updating scan request with image URL:', updateError);
        throw new Error(updateError.message);
      }
      
      setImageUrl(publicUrl);
      
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

  if (isLoading || isRoleLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-blue-600 border-solid rounded-full animate-spin mb-4 mx-auto"></div>
          <h2 className="text-xl font-medium text-gray-700">Loading scan request details</h2>
        </div>
      </div>
    );
  }

  if (!scanRequest) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Button 
          variant="outline" 
          onClick={() => router.push('/scan-requests')}
          className="flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Scan Requests
        </Button>

        <div className="text-center p-6 bg-white rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-800 mb-2">Scan Request Not Found</h3>
          <p className="text-gray-500 mb-4">The scan request you're looking for doesn't exist or you don't have permission to view it.</p>
        </div>
      </div>
    );
  }
  return (
    <div className="container mx-auto p-6 space-y-6 max-w-5xl">
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          onClick={() => router.push(`/scan-requests/${id}`)}
          className="flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Scan Request
        </Button>
      </div>

      <div ref={reportRef} className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
        {/* Report header with logo and title */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Ophthalmological Assessment Report</h1>
              <p className="text-blue-100 mt-1">Advanced AI-Assisted Analysis</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-100">Report Date: {new Date().toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'})}</p>
              <p className="text-sm text-blue-100">Patient: {scanRequest.patient_username || scanRequest.patient_id}</p>
              <p className="text-sm text-blue-100">Reference: {scanRequest.id}</p>
            </div>
          </div>
        </div>        {/* Patient Information */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
            <User className="h-5 w-5 mr-2 text-blue-600" />
            Patient Information
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">            <div className="space-y-1">
              <p className="text-sm text-gray-500">Full Name</p>
              <p className="font-medium">{scanRequest.patient_username || `Patient ${scanRequest.patient_id?.substring(0, 8)}`}</p>            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Patient ID</p>
              <p className="font-medium">{(scanRequest.patientId || scanRequest.patient_id)?.substring(0, 11)}...</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Request Date</p>
              <p className="font-medium">{formatDate(scanRequest.requestDate || scanRequest.created_at)}</p>
            </div>            <div className="space-y-1">
              <p className="text-sm text-gray-500">Physician</p>
              <p className="font-medium">{scanRequest.assigned_doctor_username || `Dr. ${scanRequest.assigned_doctor_id?.substring(0, 8)}`}</p>
            </div>
          </div>
        </div>        {/* Clinical Notes */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
            <FileText className="h-5 w-5 mr-2 text-blue-600" />
            Clinical Notes
          </h2>
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-gray-700">{scanRequest.notes || 'No clinical notes provided'}</p>
          </div>
        </div>
        
        {/* Doctor's Assessment Notes */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
            <Stethoscope className="h-5 w-5 mr-2 text-blue-600" />
            Doctor's Assessment
          </h2>
          {!result && (
            <div className="space-y-4">
              <textarea
                className="w-full min-h-[150px] p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                placeholder="Enter your clinical assessment, diagnosis, and recommended treatment plan..."
                value={doctorNotes}
                onChange={(e) => setDoctorNotes(e.target.value)}
              />
              <div className="flex justify-end">
                <Button 
                  onClick={handleSaveNotes}
                  disabled={isSavingNotes}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isSavingNotes ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Save Clinical Notes
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
          {doctorNotes && !result && (
            <div className="mt-4 bg-green-50 p-4 rounded-md border border-green-100">
              <p className="text-gray-700">{doctorNotes}</p>
            </div>
          )}
        </div>
        
        {/* AI Service Status Alert */}
        {serviceStatus !== 'online' && (
          <div className="mx-6 my-3">
            <div className="flex items-center p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-amber-500 mr-3 flex-shrink-0" />
              <div>
                <p className="text-amber-800 font-medium">
                  {serviceStatus === 'checking' 
                    ? 'Checking AI service status...' 
                    : 'AI Service Offline'}
                </p>
                {serviceStatus === 'offline' && (
                  <p className="text-amber-700 text-sm mt-1">
                    The diagnostic AI service is currently unavailable. Please ensure the FastAPI backend server is running.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}{/* Image Upload */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
            <Eye className="h-5 w-5 mr-2 text-blue-600" />
            Retinal Scan Imaging
          </h2>
          
          <div className="space-y-4">
            {!imagePreview && !imageUrl ? (
              <div className="border-2 border-dashed border-blue-200 bg-blue-50 rounded-lg p-8">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                  disabled={isAnalyzing}
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
                  <span className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full">PNG, JPG up to 10MB</span>
                </label>
              </div>
            ) : (
              <div className="rounded-lg overflow-hidden shadow-md border border-gray-100">
                <div className="bg-gray-800 px-4 py-2 flex justify-between items-center">
                  <span className="text-white text-sm font-medium">Retinal Scan Image</span>
                  <Button 
                    variant="ghost"
                    size="icon" 
                    className="h-7 w-7 rounded-full bg-gray-700 hover:bg-gray-600" 
                    onClick={clearImage}
                    disabled={isAnalyzing}
                  >
                    <X className="h-4 w-4 text-white" />
                  </Button>
                </div>
                <div className="relative aspect-video w-full bg-black">
                  <Image
                    src={imagePreview || imageUrl}
                    alt="Retinal Scan Preview"
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
                {isUploading && (
                  <div className="bg-blue-50 p-3">
                    <div className="flex justify-center items-center">
                      <RefreshCw className="h-5 w-5 animate-spin text-blue-600 mr-2" />
                      <span className="text-blue-700">Uploading image: {uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                  </div>
                )}
                {isAnalyzing ? (
                  <div className="bg-blue-50 p-3">
                    <div className="flex justify-center items-center">
                      <RefreshCw className="h-5 w-5 animate-spin text-blue-600 mr-2" />
                      <span className="text-blue-700">Processing image analysis...</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-gray-50">
                    <Button
                      onClick={handleAnalyzeImage}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      disabled={serviceStatus !== 'online' || isUploading}
                    >
                      <FileImage className="h-4 w-4 mr-2" />
                      Analyze Retinal Scan
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>{/* Analysis Results */}
        {result && (
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
              <FileText className="h-5 w-5 mr-2 text-blue-600" />
              AI Analysis Results
            </h2>
            
            {/* Primary Diagnosis Card */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg mb-6 border border-blue-100">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                <div className="flex items-center">
                  <div className="bg-blue-600 rounded-full p-2 mr-3">
                    <Eye className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-lg font-medium text-gray-700">Primary Diagnosis</span>
                </div>
                <div className="mt-2 md:mt-0">
                  <span className="text-xl font-bold text-blue-700 bg-white px-4 py-2 rounded-full shadow-sm border border-blue-200">
                    {formatCondition(result.prediction)}
                  </span>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-sm uppercase tracking-wider text-gray-500 mb-3">Confidence Levels</h3>
                <div className="space-y-4">
                  {result.allPredictions.map(({ label, probability }) => (
                    <div key={label} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-700">{formatCondition(label)}</span>
                        <span className="font-mono text-blue-700 font-semibold">{probability.toFixed(2)}%</span>
                      </div>
                      <div className="w-full bg-white rounded-full h-3 shadow-inner">
                        <div 
                          className={`${
                            label === result.prediction 
                              ? 'bg-blue-600' 
                              : probability > 30 
                                ? 'bg-blue-400' 
                                : 'bg-gray-300'
                          } h-3 rounded-full transition-all duration-500 ease-in-out`}
                          style={{ width: `${probability}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Diagnostic Summary */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-lg mb-4 text-gray-800">Clinical Assessment</h3>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-blue-100 rounded-full p-1 mr-3 mt-1">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-gray-700 mb-2">
                      Based on the AI model analysis, this scan shows signs consistent with 
                      <span className="font-semibold text-blue-700"> {formatCondition(result.prediction)}</span> with 
                      <span className="font-semibold"> {result.confidence.toFixed(2)}%</span> confidence.
                    </p>
                    <p className="text-gray-700">
                      {result.prediction === 'normal' 
                        ? 'No significant abnormalities were detected in this scan.'
                        : 'Further clinical evaluation is recommended to confirm this AI-assisted diagnosis.'}
                    </p>
                  </div>
                </div>
                
                {result.prediction !== 'normal' && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <h4 className="font-medium text-gray-700 mb-2">Recommended Actions</h4>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      <li>Schedule follow-up examination within 2-4 weeks</li>
                      <li>Consider additional specialized tests to confirm diagnosis</li>
                      <li>Review patient history for risk factors related to {formatCondition(result.prediction)}</li>
                    </ul>
                  </div>
                )}
                
                {/* Doctor's Clinical Notes Section */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                    <Stethoscope className="h-4 w-4 mr-2 text-blue-600" />
                    Doctor's Clinical Notes
                  </h4>
                  <div className="space-y-4">
                    <textarea
                      className="w-full min-h-[150px] p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                      placeholder="Enter your clinical assessment, diagnosis, and recommended treatment plan..."
                      value={doctorNotes}
                      onChange={(e) => setDoctorNotes(e.target.value)}
                    />
                    <div className="flex justify-end">
                      <Button 
                        onClick={handleSaveNotes}
                        disabled={isSavingNotes}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {isSavingNotes ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <FileText className="h-4 w-4 mr-2" />
                            Save Clinical Notes
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>      {/* Download Button and Actions */}
      {(result || doctorNotes) && (
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg font-semibold text-gray-800 mb-1">
                {result ? 'Analysis Report Complete' : 'Clinical Assessment Complete'}
              </h3>
              <p className="text-gray-600 text-sm">Assessment for {scanRequest.patient_username || "Patient"} - Report ready for download</p>
            </div>
            <div className="flex space-x-3">
              <Button 
                variant="outline"
                onClick={() => router.push(`/scan-requests/${id}`)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Return to Request
              </Button>
              <Button 
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Download className="h-4 w-4" />
                Download PDF Report
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
