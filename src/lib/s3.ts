import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

export const BUCKET_NAME = process.env.SUPABASE_BUCKET_NAME || "image";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn(
    "Warning: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set. File uploads may not work.",
  );
}

// Create Supabase client with service role key for admin operations
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export const SUPABASE_PUBLIC_BASE_URL =
  process.env.SUPABASE_PUBLIC_BASE_URL ||
  `${supabaseUrl}/storage/v1/object/public`;
