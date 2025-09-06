'use client';

import { useState } from 'react';
import { uploadVideoToCloudinary, uploadPdfToCloudinary } from '@/lib/cloudinary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CloudinaryTestPage() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleVideoUpload = async () => {
    if (!videoFile) return;
    
    setIsUploading(true);
    setError('');
    
    try {
      const url = await uploadVideoToCloudinary(videoFile);
      setVideoUrl(url);
    } catch (err: any) {
      setError(err.message || 'Failed to upload video');
    } finally {
      setIsUploading(false);
    }
  };

  const handlePdfUpload = async () => {
    if (!pdfFile) return;
    
    setIsUploading(true);
    setError('');
    
    try {
      const url = await uploadPdfToCloudinary(pdfFile);
      setPdfUrl(url);
    } catch (err: any) {
      setError(err.message || 'Failed to upload PDF');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Cloudinary Upload Test</h1>
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Configuration Status</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Cloud Name: {process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'Not configured'}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          API Key: {process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY ? 'Configured' : 'Not configured'}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          API Secret: {process.env.CLOUDINARY_API_SECRET ? 'Configured' : 'Not configured'}
        </p>
        <p className="text-xs text-green-600 dark:text-green-400 mt-2">
          ✅ Using signed uploads with server-side signature generation
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Video Upload Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="video">Select Video File</Label>
              <Input
                id="video"
                type="file"
                accept="video/*"
                onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
              />
            </div>
            <Button 
              onClick={handleVideoUpload} 
              disabled={!videoFile || isUploading}
              className="w-full"
            >
              {isUploading ? 'Uploading...' : 'Upload Video'}
            </Button>
            {videoUrl && (
              <div className="mt-4">
                <Label>Uploaded URL:</Label>
                <p className="text-sm text-gray-600 break-all">{videoUrl}</p>
                <video controls className="w-full mt-2">
                  <source src={videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>PDF Upload Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="pdf">Select PDF File</Label>
              <Input
                id="pdf"
                type="file"
                accept=".pdf"
                onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
              />
            </div>
            <Button 
              onClick={handlePdfUpload} 
              disabled={!pdfFile || isUploading}
              className="w-full"
            >
              {isUploading ? 'Uploading...' : 'Upload PDF'}
            </Button>
            {pdfUrl && (
              <div className="mt-4">
                <Label>Uploaded URL:</Label>
                <p className="text-sm text-gray-600 break-all">{pdfUrl}</p>
                <a 
                  href={pdfUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Open PDF
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {error && (
        <Card className="mt-8 border-red-500">
          <CardContent className="pt-6">
            <p className="text-red-600">Error: {error}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
