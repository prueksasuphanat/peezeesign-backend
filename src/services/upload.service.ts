// src/services/upload.service.ts
import { BUCKET_NAME, supabase, SUPABASE_PUBLIC_BASE_URL } from "../lib/s3";

/**
 * Generate unique filename with UUID
 */
export const generateFileName = (
  folder: string,
  originalName: string,
): string => {
  const ext = originalName.split(".").pop()?.toLowerCase() || "jpg";
  const uuid = crypto.randomUUID();
  return `${folder}/${uuid}.${ext}`;
};

/**
 * Upload file to Supabase Storage
 */
export const uploadToSupabase = async (
  file: Express.Multer.File,
  folder: string,
): Promise<string> => {
  const filePath = generateFileName(folder, file.originalname);

  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error("Upload failed - no data returned");
    }

    // Return public URL
    return `${SUPABASE_PUBLIC_BASE_URL}/${BUCKET_NAME}/${filePath}`;
  } catch (error: any) {
    throw new Error(
      `อัปโหลดไฟล์ไม่สำเร็จ: ${error?.message || "Unknown error"}`,
    );
  }
};

/**
 * Delete file from Supabase Storage
 */
export const deleteFromSupabase = async (imageUrl: string): Promise<void> => {
  try {
    // Extract file path from URL
    const urlParts = imageUrl.split(`/${BUCKET_NAME}/`);
    if (urlParts.length < 2) return;

    const filePath = urlParts[1].split("?")[0];

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      console.error("Failed to delete old image:", error);
    }
  } catch (error) {
    // Log but don't throw - deletion failure shouldn't break the flow
    console.error("Failed to delete old image:", error);
  }
};
