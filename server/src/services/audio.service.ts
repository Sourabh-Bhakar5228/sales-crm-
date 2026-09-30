import fs from 'fs';
import path from 'path';
import { cloudinary } from '../config/cloudinary.js';
import { IAudioDetails } from '../types/index.js';
import { Types } from 'mongoose';

export class AudioService {
  static async uploadAudio(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
    uploaderId: string | Types.ObjectId
  ): Promise<IAudioDetails> {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    const hasCloudinary =
      cloudName &&
      cloudName !== 'your_cloud_name' &&
      cloudName !== 'demo_cloud' &&
      apiKey &&
      apiKey !== 'your_api_key' &&
      apiKey !== 'demo_key' &&
      apiSecret &&
      apiSecret !== 'your_api_secret' &&
      apiSecret !== 'demo_secret';

    if (hasCloudinary) {
      try {
        const uploadResult = await new Promise<{
          secure_url: string;
          public_id: string;
          duration?: number;
        }>((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              resource_type: 'video', // Cloudinary handles audio under video
              folder: 'vibhanu_crm/audio',
              public_id: `call_${Date.now()}_${path.parse(fileName).name}`
            },
            (error, result) => {
              if (error || !result) {
                return reject(error || new Error('Upload to Cloudinary failed'));
              }
              resolve(result as { secure_url: string; public_id: string; duration?: number });
            }
          );
          stream.end(fileBuffer);
        });

        return {
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          fileName,
          mimeType,
          duration: uploadResult.duration ? Math.round(uploadResult.duration) : 60,
          uploadedAt: new Date(),
          uploadedBy: new Types.ObjectId(uploaderId)
        };
      } catch (err) {
        console.warn('[AudioService] Cloudinary upload failed, using local storage fallback:', err);
      }
    }

    // Local Storage Fallback
    const uploadDir = path.join(process.cwd(), 'uploads', 'audio');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const sanitizedFileName = `${uniqueSuffix}-${path.basename(fileName)}`;
    const filePath = path.join(uploadDir, sanitizedFileName);

    fs.writeFileSync(filePath, fileBuffer);

    // Static accessible URL via Express static middleware
    const localUrl = `/uploads/audio/${sanitizedFileName}`;

    return {
      url: localUrl,
      publicId: `local_${sanitizedFileName}`,
      fileName,
      mimeType,
      duration: 75, // Default placeholder duration for demo
      uploadedAt: new Date(),
      uploadedBy: new Types.ObjectId(uploaderId)
    };
  }
}
