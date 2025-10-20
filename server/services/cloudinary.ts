import { v2 as cloudinary } from 'cloudinary';

export function initializeCloudinaryService(): boolean {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    console.warn('⚠️ Cloudinary credentials not configured. Image upload service disabled.');
    console.warn('Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env');
    return false;
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });

  console.log('✅ Cloudinary service initialized');
  return true;
}

export async function uploadProductImage(
  fileBuffer: Buffer,
  fileName: string,
  folder: string = 'giantcasino/products'
): Promise<{ url: string; publicId: string } | null> {
  try {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: 'auto',
          public_id: fileName.replace(/\.[^.]+$/, ''),
          overwrite: false,
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else if (result) {
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
            });
          }
        }
      );

      uploadStream.end(fileBuffer);
    });
  } catch (error) {
    console.error('❌ Failed to upload image to Cloudinary:', error);
    return null;
  }
}

export async function deleteProductImage(publicId: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    if (result.result === 'ok') {
      console.log(`✅ Image deleted: ${publicId}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ Failed to delete image from Cloudinary:', error);
    return false;
  }
}

export function getCloudinarySignature(
  folder: string = 'giantcasino/products'
): { signature: string; timestamp: number; cloudName: string; apiKey: string } | null {
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;

  if (!apiSecret || !cloudName || !apiKey) {
    return null;
  }

  const crypto = require('crypto');
  const timestamp = Math.floor(Date.now() / 1000);
  const paramsToSign = {
    timestamp,
    folder,
  };

  const paramsString = Object.keys(paramsToSign)
    .sort()
    .map(key => `${key}=${paramsToSign[key as keyof typeof paramsToSign]}`)
    .join('&');

  const signature = crypto
    .createHash('sha1')
    .update(paramsString + apiSecret)
    .digest('hex');

  return {
    signature,
    timestamp,
    cloudName,
    apiKey,
  };
}
