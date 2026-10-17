import { createClient } from '@supabase/supabase-js';
import api from '../api/axios';
import { supabase } from '@/utils/s3';

export async function uploadFileToStorage(file, type) {
  if (!file) return null;

  const response = await api.post("/api/get-presignedUrl", {
    filename: file.name,
    contentType: file.type,
    type,
  });

  const data = response.data?.data ?? response.data;
  const { token, tempKey } = data;

  if (!token || !tempKey) {
    throw new Error("Invalid upload token response from server");
  }

  const { error } = await supabase.storage
    .from("devflow-uploads")
    .uploadToSignedUrl(tempKey, token, file, {
      contentType: file.type,
    });

  if (error) {
    throw new Error(`Failed to upload ${file.name}: ${error.message}`);
  }

  return tempKey;
}