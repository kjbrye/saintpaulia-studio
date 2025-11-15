// src/lib/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

const getEnvVar = (key, defaultValue) => {
  if (typeof import.meta !== "undefined" && import.meta.env) {
    const value = import.meta.env[key];
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }

  if (typeof globalThis !== "undefined" && globalThis.process?.env) {
    const value = globalThis.process.env[key];
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }

  return defaultValue;
};

const supabaseUrl = getEnvVar("VITE_SUPABASE_URL", "http://127.0.0.1:54321");
const isLocalSupabase = /^(https?:\/\/)?(localhost|127\.0\.0\.1)(:\d+)?/.test(
  supabaseUrl || ""
);

const defaultAnonKey = isLocalSupabase
  ? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"
  : undefined;

const supabaseAnonKey = getEnvVar("VITE_SUPABASE_ANON_KEY", defaultAnonKey)?.trim();

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase URL or anon key in environment variables.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
