// Cloudinary configuration for client-side uploads
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY) {
  console.error('Cloudinary configuration is missing. Please check your environment variables.');
}

// Upload video file to Cloudinary using signed uploads
export const uploadVideoToCloudinary = async (file: File): Promise<string> => {
  try {
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY) {
      throw new Error('Cloudinary configuration is missing');
    }

    // Generate unique public ID
    const timestamp = Math.round(new Date().getTime() / 1000);
    const publicId = `video-${timestamp}-${Math.random().toString(36).substring(2)}`;

    // Get signature from our API route
    const signatureResponse = await fetch('/api/cloudinary-signature', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ timestamp, publicId }),
    });

    if (!signatureResponse.ok) {
      throw new Error('Failed to generate signature');
    }

    const { signature } = await signatureResponse.json();

    // Upload file with signature
    const formData = new FormData();
    formData.append('file', file);
    formData.append('public_id', publicId);
    formData.append('timestamp', timestamp.toString());
    formData.append('api_key', CLOUDINARY_API_KEY);
    formData.append('signature', signature);
    formData.append('resource_type', 'video');

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Cloudinary upload error:', errorData);
      throw new Error('Failed to upload video');
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading video:', error);
    throw new Error('Failed to upload video to Cloudinary');
  }
};

// Upload PDF file to Cloudinary using signed uploads
export const uploadPdfToCloudinary = async (file: File): Promise<string> => {
  try {
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY) {
      throw new Error('Cloudinary configuration is missing');
    }

    // Generate unique public ID
    const timestamp = Math.round(new Date().getTime() / 1000);
    const publicId = `pdf-${timestamp}-${Math.random().toString(36).substring(2)}`;

    // Get signature from our API route
    const signatureResponse = await fetch('/api/cloudinary-signature', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ timestamp, publicId }),
    });

    if (!signatureResponse.ok) {
      throw new Error('Failed to generate signature');
    }

    const { signature } = await signatureResponse.json();

    // Upload file with signature
    const formData = new FormData();
    formData.append('file', file);
    formData.append('public_id', publicId);
    formData.append('timestamp', timestamp.toString());
    formData.append('api_key', CLOUDINARY_API_KEY);
    formData.append('signature', signature);
    formData.append('resource_type', 'raw');

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/raw/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Cloudinary upload error:', errorData);
      throw new Error('Failed to upload PDF');
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading PDF:', error);
    throw new Error('Failed to upload PDF to Cloudinary');
  }
};

// Upload multiple PDF files to Cloudinary
export const uploadMultiplePdfsToCloudinary = async (files: File[]): Promise<string[]> => {
  try {
    const uploadPromises = files.map(file => uploadPdfToCloudinary(file));
    const urls = await Promise.all(uploadPromises);
    return urls;
  } catch (error) {
    console.error('Error uploading PDFs:', error);
    throw new Error('Failed to upload PDFs to Cloudinary');
  }
};
