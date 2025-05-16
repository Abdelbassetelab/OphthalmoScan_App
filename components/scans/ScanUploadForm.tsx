'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ScanUploadFormProps } from './types';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

export default function ScanUploadForm({ 
  onUploadComplete, 
  onUploadError 
}: ScanUploadFormProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    // Handle file drop
  };

  return (
    <Card className="p-6">
      <form className="space-y-6">
        {/* File Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center ${
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onDragEnter={handleDragEnter}
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              {/* Upload icon placeholder */}
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
            </div>
            <div>
              <p className="text-gray-600">Drag and drop your scan file here, or</p>
              <Button type="button" variant="outline" className="mt-2">
                Browse Files
              </Button>
            </div>
          </div>
        </div>

        {/* Scan Metadata */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="patientId">Patient</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select patient" />
              </SelectTrigger>
              <SelectContent>
                {/* Patient options will be populated here */}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="scanType">Scan Type</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select scan type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fundus">Fundus</SelectItem>
                <SelectItem value="oct">OCT</SelectItem>
                <SelectItem value="visual-field">Visual Field</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="scanDate">Scan Date</Label>
            <Input type="date" id="scanDate" />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <textarea 
              id="notes"
              className="w-full min-h-[100px] p-2 border rounded-md"
              placeholder="Add any relevant notes about the scan..."
            />
          </div>
        </div>

        {/* Upload Progress */}
        {uploadProgress > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}

        <Button type="submit" className="w-full">
          Upload Scan
        </Button>
      </form>
    </Card>
  );
}
