import { UploadApiResponse } from "cloudinary";
import cloudinary from "../config/cloudinary.js";

export const uploadAudioToCloudinary = (
  buffer: Buffer,
  fileName: string
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "video",
        folder: "vibhanu-crm/audio",
        public_id: `${Date.now()}-${fileName
          .replace(/\s+/g, "-")
          .replace(/\.[^/.]+$/, "")}`,
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        if (!result) {
          reject(new Error("Cloudinary upload failed"));
          return;
        }

        resolve(result);
      }
    );

    uploadStream.end(buffer);
  });
};

export const deleteAudioFromCloudinary = async (
  publicId: string
) => {
  return cloudinary.uploader.destroy(publicId, {
    resource_type: "video",
  });
};
