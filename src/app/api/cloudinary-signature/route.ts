import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { timestamp, publicId } = await request.json();
    
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    
    if (!apiSecret) {
      return NextResponse.json(
        { error: 'Cloudinary API secret not configured' },
        { status: 500 }
      );
    }

    // Create signature string
    const signatureString = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
    
    // Generate signature using SHA-1
    const signature = crypto
      .createHash('sha1')
      .update(signatureString)
      .digest('hex');

    return NextResponse.json({ signature });
  } catch (error) {
    console.error('Error generating signature:', error);
    return NextResponse.json(
      { error: 'Failed to generate signature' },
      { status: 500 }
    );
  }
}
