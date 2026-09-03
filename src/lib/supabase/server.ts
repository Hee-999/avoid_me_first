import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

// Supabase Admin Client (for server-side ONLY)
// Bypasses RLS using the Service Role Key.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "dummy-key";

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * Generates a cryptographically secure random token
 */
export function generateOwnerToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Hashes the owner token for secure database storage
 */
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Generates a short, readable random string for sharing (e.g., H7ka92xxxx)
 */
export function generateShareId(): string {
  return crypto.randomBytes(4).toString("hex").substring(0, 7);
}
